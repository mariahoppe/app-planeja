const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Usuario } = require('../models');
const { AppError } = require('../utils/errorHandler');

const SALT_ROUNDS = 12;
const MAX_ERROS_CODIGO = 5;

const gerarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const registro = async ({ nome, email, senha }) => {
  const existe = await Usuario.findOne({ where: { email } });
  if (existe) throw new AppError('Email já cadastrado', 409);

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await Usuario.create({ nome, email, senha_hash });

  const token = gerarToken(usuario);

  return {
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    token
  };
};

const login = async ({ email, senha }) => {
  const usuario = await Usuario.scope('comSenha').findOne({ where: { email } });
  if (!usuario) throw new AppError('Email ou senha incorretos', 401);

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) throw new AppError('Email ou senha incorretos', 401);

  const token = gerarToken(usuario);

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      foto_url: usuario.foto_url
    },
    token
  };
};

const esqueciSenha = async ({ email }) => {
  const usuario = await Usuario.findOne({ where: { email } });

  // Retorna sempre sucesso para não revelar se o email existe na base (segurança)
  if (!usuario) {
    return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha' };
  }

  // randomInt é o sorteio próprio para segurança; padStart mantém zeros à esquerda (ex.: 004217)
  const codigo = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

  // O código é guardado como a senha: só o hash vai para o banco
  await usuario.update({
    reset_token: await bcrypt.hash(codigo, SALT_ROUNDS),
    reset_token_expira: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos de validade
    reset_tentativas: 0
  });

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #d8d4cc; border-radius: 8px; background-color: #faf8f3;">
      <h2 style="color: #1a1a1a; font-family: Georgia, serif; font-size: 22px; margin-bottom: 16px;">Recuperação de Senha - Planeja</h2>
      <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Olá, <strong>${usuario.nome}</strong>.
      </p>
      <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Recebemos uma solicitação para redefinir a senha da sua conta no Planeja. Digite este código no aplicativo:
      </p>
      <div style="margin: 24px 0; text-align: center; color: #8a3a1f; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
        ${codigo}
      </div>
      <p style="color: #6b6b6b; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        Este código é válido por 30 minutos. Se você não solicitou a recuperação, pode ignorar este e-mail com segurança.
      </p>
      <hr style="border: 0; border-top: 1px solid #ebe8e1; margin: 20px 0;" />
      <p style="color: #9a9a9a; font-size: 12px; text-align: center; margin: 0;">
        Planeja &copy; 2026
      </p>
    </div>
  `;

  // Envia o e-mail de forma assíncrona
  const emailService = require('./emailService');
  emailService.sendEmail({
    to: usuario.email,
    subject: 'Recuperação de Senha - Planeja',
    html: emailHtml
  }).catch(err => console.error('Erro ao enviar e-mail de recuperação:', err));

  return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha' };
};


const redefinirSenha = async ({ email, codigo, senha }) => {
  // Busca pelo e-mail: duas pessoas podem receber o mesmo código de 6 dígitos
  const usuario = await Usuario.scope('comSenha').findOne({ where: { email } });

  if (!usuario || !usuario.reset_token || usuario.reset_token_expira < new Date()) {
    throw new AppError('Código inválido ou expirado', 400);
  }

  const codigoValido = await bcrypt.compare(codigo, usuario.reset_token);

  if (!codigoValido) {
    // increment soma direto no banco, então tentativas ao mesmo tempo também contam
    await usuario.increment('reset_tentativas');
    await usuario.reload();

    // No último erro o código é apagado: 6 dígitos não aguentam tentativas à vontade
    if (usuario.reset_tentativas >= MAX_ERROS_CODIGO) {
      await usuario.update({ reset_token: null, reset_token_expira: null, reset_tentativas: 0 });
    }

    throw new AppError('Código inválido ou expirado', 400);
  }

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

  await usuario.update({
    senha_hash,
    reset_token: null,
    reset_token_expira: null,
    reset_tentativas: 0
  });

  return { message: 'Senha redefinida com sucesso' };
};

module.exports = { registro, login, esqueciSenha, redefinirSenha };