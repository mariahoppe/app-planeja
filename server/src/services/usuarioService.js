const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const { AppError } = require('../utils/errorHandler');

const SALT_ROUNDS = 12;

const listar = async () => {
  return Usuario.findAll({
    attributes: { exclude: ['senha_hash', 'reset_token', 'reset_token_expira'] }
  });
};

const buscarPorId = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    attributes: { exclude: ['senha_hash', 'reset_token', 'reset_token_expira'] }
  });
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  return usuario;
};

const perfil = async (userId) => {
  return buscarPorId(userId);
};

const atualizar = async (id, dados, reqUser) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);

  if (reqUser.perfil !== 'admin' && reqUser.id !== usuario.id) {
    throw new AppError('Sem permissão para editar este usuário', 403);
  }

  if (dados.perfil && reqUser.perfil !== 'admin') {
    throw new AppError('Apenas administradores podem alterar perfil', 403);
  }

  if (dados.email && dados.email !== usuario.email) {
    const existe = await Usuario.findOne({ where: { email: dados.email } });
    if (existe) throw new AppError('Email já cadastrado', 409);
  }

  await usuario.update(dados);
  const { senha_hash, reset_token, reset_token_expira, ...result } = usuario.toJSON();
  return result;
};

const trocarSenha = async (userId, { senha_atual, nova_senha }) => {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);

  const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);
  if (!senhaValida) throw new AppError('Senha atual incorreta', 401);

  const senha_hash = await bcrypt.hash(nova_senha, SALT_ROUNDS);
  await usuario.update({ senha_hash });

  return { message: 'Senha alterada com sucesso' };
};

const excluir = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  await usuario.destroy();
};

module.exports = { listar, buscarPorId, perfil, atualizar, trocarSenha, excluir };
