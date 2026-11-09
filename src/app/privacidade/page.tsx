import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacidade do Tracker" };
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <h1 className="text-3xl font-semibold">
        Seus dados no Skillrush Tracker
      </h1>
      <p className="text-slate-400">Atualizado em 7 de novembro de 2026.</p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">O que é consultado</h2>
        <p>
          Após entrar com seu e-mail e autorizar uma consulta, enviamos o Riot
          ID, a região e a plataforma para a HenrikDev. Recebemos dados de
          identificação da conta, rank e partidas disponíveis. Não solicitamos
          sua senha Riot. O acesso por e-mail é gerenciado pelo Supabase Auth.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Visibilidade e armazenamento</h2>
        <p>
          Os resultados do tracker ficam restritos à sua sessão no Skillrush;
          não criamos um perfil público pesquisável. Guardamos temporariamente
          consultas normalizadas para evitar chamadas repetidas, além da data e
          da versão da autorização. Não guardamos o histórico completo de outros
          participantes das partidas.
        </p>
        <p>
          O cache deixa de ser utilizado após 5 minutos para consultas, 10
          minutos para rank e 1 hora para identificação. Registros expirados há
          mais de um dia são removidos na manutenção executada pelas consultas
          ao serviço. Sem acessos, a remoção aguarda a próxima manutenção. Ao
          sair, os resultados são removidos da interface deste navegador.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Revogar e apagar</h2>
        <p>
          Use “Revogar autorização e apagar consultas” na página Tracker para
          remover a autorização e o cache vinculados ao seu usuário. Isso não
          apaga dados já mantidos pela HenrikDev, pela Riot ou os registros da
          sua conta de acesso ao Skillrush.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limites desta integração</h2>
        <p>
          A declaração de autorização não verifica a titularidade da conta Riot.
          Consulte apenas contas para as quais você tem autorização. A
          integração não oficial não é endossada pela Riot e depende das
          condições e da disponibilidade da HenrikDev. Não oferece histórico
          garantidamente completo, MMR oculto ou Tracker Score.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Transmissões e campeonatos</h2>
        <p>
          Os campeonatos utilizam dados da PandaScore. Quando você abre uma
          transmissão, o player incorporado da Twitch ou do YouTube conecta seu
          navegador ao respectivo serviço, sujeito às políticas desse provedor.
        </p>
      </section>
    </main>
  );
}
