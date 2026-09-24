const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Usuario } = require('../models');
const { AppError } = require('../utils/errorHandler');

const SALT_ROUNDS = 12;

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
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) throw new AppError('Email ou senha incorretos', 401);

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) throw new AppError('Email ou senha incorretos', 401);

  const token = gerarToken(usuario);

  return {
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    token
  };
};

const esqueciSenha = async ({ email }) => {
  const usuario = await Usuario.findOne({ where: { email } });

  // Retorna sempre sucesso para não revelar se o email existe na base (segurança)
  if (!usuario) {
    return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  await usuario.update({
    reset_token: resetTokenHash,
    reset_token_expira: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos de validade
  });

  // Gera o link de recuperação baseado na URL do front-end configurada no .env
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5174';
  const linkRecuperacao = `${frontendUrl}/redefinir-senha?token=${resetToken}`;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #d8d4cc; border-radius: 8px; background-color: #faf8f3;">
      <h2 style="color: #1a1a1a; font-family: Georgia, serif; font-size: 22px; margin-bottom: 16px;">Recuperação de Senha - Organiza Viagens</h2>
      <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
        Olá, <strong>${usuario.nome}</strong>.
      </p>
      <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Recebemos uma solicitação para redefinir a senha da sua conta no Organiza Viagens. Para prosseguir, clique no botão abaixo:
      </p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="${linkRecuperacao}" style="display: inline-block; background-color: #8a3a1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
          Redefinir Senha
        </a>
      </div>
      <p style="color: #6b6b6b; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
        Este link é válido por 30 minutos. Se você não solicitou a recuperação, pode ignorar este e-mail com segurança.
      </p>
      <hr style="border: 0; border-top: 1px solid #ebe8e1; margin: 20px 0;" />
      <p style="color: #9a9a9a; font-size: 12px; text-align: center; margin: 0;">
        Organiza Viagens &copy; 2026
      </p>
    </div>
  `;

  // Envia o e-mail de forma assíncrona
  const emailService = require('./emailService');
  emailService.sendEmail({
    to: usuario.email,
    subject: 'Recuperação de Senha - Organiza Viagens',
    html: emailHtml
  }).catch(err => console.error('Erro ao enviar e-mail de recuperação:', err));

  const resposta = { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha' };

  if (process.env.NODE_ENV === 'development') {
    resposta.reset_token = resetToken;
  }

  return resposta;
};


const redefinirSenha = async ({ token, senha }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const usuario = await Usuario.findOne({
    where: { reset_token: tokenHash }
  });

  if (!usuario || !usuario.reset_token_expira || usuario.reset_token_expira < new Date()) {
    throw new AppError('Token inválido ou expirado', 400);
  }

  const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

  await usuario.update({
    senha_hash,
    reset_token: null,
    reset_token_expira: null
  });

  return { message: 'Senha redefinida com sucesso' };
};

// ... (outros métodos do service)

const validarToken = async ({ token }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const usuario = await Usuario.findOne({ where: { reset_token: tokenHash } });

  // Se não achar o usuário, o token é inválido
  if (!usuario) {
    throw new AppError('Token inválido', 400);
  }

  // Verifica se expirou
  if (!usuario.reset_token_expira || usuario.reset_token_expira < new Date()) {
    // Se expirou, gera um NOVO token e envia um novo e-mail AUTOMATICAMENTE
    const novoToken = crypto.randomBytes(32).toString('hex');
    const novoTokenHash = crypto.createHash('sha256').update(novoToken).digest('hex');

    await usuario.update({
      reset_token: novoTokenHash,
      reset_token_expira: new Date(Date.now() + 30 * 60 * 1000)
    });

    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5174';
    const linkRecuperacao = `${frontendUrl}/redefinir-senha?token=${novoToken}`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #d8d4cc; border-radius: 8px; background-color: #faf8f3;">
        <h2 style="color: #1a1a1a; font-family: Georgia, serif; font-size: 22px; margin-bottom: 16px;">Novo Link de Recuperação - Organiza Viagens</h2>
        <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
          Olá, <strong>${usuario.nome}</strong>.
        </p>
        <p style="color: #3a3a3a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          O link anterior que você acessou expirou. Por segurança, geramos e enviamos este novo link para você redefinir sua senha:
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${linkRecuperacao}" style="display: inline-block; background-color: #8a3a1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #6b6b6b; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">
          Este novo link é válido por mais 30 minutos.
        </p>
        <hr style="border: 0; border-top: 1px solid #ebe8e1; margin: 20px 0;" />
        <p style="color: #9a9a9a; font-size: 12px; text-align: center; margin: 0;">
          Organiza Viagens &copy; 2026
        </p>
      </div>
    `;

    const emailService = require('./emailService');
    emailService.sendEmail({
      to: usuario.email,
      subject: 'Novo Link de Recuperação - Organiza Viagens',
      html: emailHtml
    }).catch(err => console.error('Erro ao enviar novo e-mail:', err));

    // Oculta parte do e-mail para não expor na tela (Ex: mar***@gmail.com)
    const partesEmail = usuario.email.split('@');
    const emailOculto = `${partesEmail[0].substring(0, 3)}***@${partesEmail[1]}`;

    return { valido: false, expirado: true, email: emailOculto };
  }

  // Token está válido e no prazo
  return { valido: true };
};

module.exports = { registro, login, esqueciSenha, redefinirSenha, validarToken };