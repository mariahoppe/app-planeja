const { apagarFotos, caminhoNoBucket } = require('../src/services/storageService');

const URL_SUPABASE = 'https://abc.supabase.co';
const publica = (caminho) => `${URL_SUPABASE}/storage/v1/object/public/dicas/${caminho}`;

describe('caminhoNoBucket', () => {
  it('extrai o caminho de um endereço do bucket dicas', () => {
    expect(caminhoNoBucket(URL_SUPABASE, publica('12/foto%20um.jpg'))).toBe('12/foto um.jpg');
  });

  it('ignora endereços de fora do bucket', () => {
    expect(caminhoNoBucket(URL_SUPABASE, 'https://outro.site/foto.jpg')).toBeNull();
    expect(caminhoNoBucket(URL_SUPABASE, `${URL_SUPABASE}/storage/v1/object/public/avatares/1.jpg`)).toBeNull();
  });
});

describe('apagarFotos', () => {
  const ambiente = { ...process.env };
  let avisos;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    avisos = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...ambiente };
    avisos.mockRestore();
    delete global.fetch;
  });

  it('sem a chave de serviço, não chama o Storage e só avisa', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_URL = URL_SUPABASE;
    await apagarFotos([publica('1/a.jpg')]);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(avisos).toHaveBeenCalled();
  });

  it('com a chave, apaga só os arquivos do bucket, numa chamada', async () => {
    process.env.SUPABASE_URL = `${URL_SUPABASE}/`;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-secreta';
    await apagarFotos([publica('1/a.jpg'), 'https://outro.site/x.jpg', publica('1/b.jpg')]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [endereco, opcoes] = global.fetch.mock.calls[0];
    expect(endereco).toBe(`${URL_SUPABASE}/storage/v1/object/dicas`);
    expect(opcoes.method).toBe('DELETE');
    expect(opcoes.headers.Authorization).toBe('Bearer chave-secreta');
    expect(JSON.parse(opcoes.body)).toEqual({ prefixes: ['1/a.jpg', '1/b.jpg'] });
  });

  it('não lança erro se o Storage falhar', async () => {
    process.env.SUPABASE_URL = URL_SUPABASE;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'chave-secreta';
    global.fetch.mockRejectedValue(new Error('sem rede'));
    await expect(apagarFotos([publica('1/a.jpg')])).resolves.toBeUndefined();
  });
});
