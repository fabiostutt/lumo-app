import TitleAction from "@/components/TitleAction";
import MarkdownContent from "@/components/MarkdownContent";

const CONTENT = `
# Política de Privacidade

Última atualização: 8 de outubro de 2026

O Lumo é um aplicativo de agenda e gestão de atendimentos para profissionais autônomos, operado por [NOME OU RAZÃO SOCIAL], [CNPJ/CPF]. Esta política explica quais dados coletamos, para que usamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD).

## 1. Quem é quem

- **Profissional (você, que usa o Lumo):** somos o controlador dos dados da sua conta.
- **Clientes do profissional:** os dados deles são cadastrados pelo profissional. Nesse caso o profissional é o controlador e o Lumo atua como operador, tratando esses dados apenas para executar as funções do aplicativo.

## 2. Dados que coletamos

**Da sua conta:**
- Nome, e-mail e foto de perfil, recebidos do Google quando você entra com "Continuar com Google".
- Dados de assinatura (plano, status e identificadores de cobrança).

**Cadastrados por você sobre seus clientes:**
- Nome, número de WhatsApp, e-mail e CPF.
- Sessões: data, horário, link, status (pendente, confirmada ou cancelada) e se as notificações estão ativas.

**Gerados pelo uso:**
- Respostas de "Confirmar" ou "Cancelar" enviadas pelo cliente no WhatsApp.
- Dados técnicos básicos de acesso, como tipo de dispositivo e registros de erro.

Não armazenamos dados de cartão. Os pagamentos são processados pelo Stripe.

## 3. Dados do Google

Ao entrar com Google, recebemos apenas nome, e-mail e foto de perfil. Usamos essas informações somente para identificar você e manter sua conta. Não vendemos esses dados, não os usamos para publicidade e não os compartilhamos para outras finalidades.

## 4. Para que usamos os dados

- Criar e manter sua conta e autenticar seu acesso.
- Permitir que você agende e gerencie sessões e clientes.
- Enviar, em seu nome, mensagens de confirmação e lembrete pelo WhatsApp aos seus clientes, quando você ativa as notificações.
- Atualizar o status da sessão quando o cliente responde à mensagem.
- Processar a assinatura do plano Pro.
- Cumprir obrigações legais e prevenir fraudes e abusos.

## 5. Com quem compartilhamos

Usamos prestadores de serviço que tratam dados em nosso nome:
- **Supabase:** banco de dados e autenticação.
- **Vercel:** hospedagem do aplicativo.
- **Meta (WhatsApp Business Platform):** envio das mensagens aos clientes.
- **Stripe:** cobrança e assinaturas.
- **Google:** login.

Alguns desses prestadores podem processar dados fora do Brasil. Nesses casos adotamos as salvaguardas previstas na LGPD. Não vendemos dados pessoais.

## 6. Por quanto tempo guardamos

Mantemos os dados enquanto sua conta estiver ativa. Ao excluir a conta, removemos ou anonimizamos os dados em até [PRAZO, ex.: 30 dias], exceto o que precisarmos guardar por obrigação legal.

## 7. Seus direitos

Você pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação de dados e informações sobre compartilhamento, além de revogar consentimentos. Os clientes do profissional também podem fazer esses pedidos, e nesse caso encaminharemos o pedido ao profissional responsável. Escreva para [E-MAIL DE CONTATO].

## 8. Responsabilidade do profissional

Ao cadastrar dados de clientes e ativar mensagens por WhatsApp, você declara que tem base legal ou autorização para tratar esses dados e contatar essas pessoas.

## 9. Segurança

Usamos controles de acesso, criptografia em trânsito e boas práticas para proteger os dados. Nenhum sistema é totalmente imune a incidentes, e em caso de incidente relevante avisaremos os afetados e a ANPD, conforme a lei.

## 10. Crianças e adolescentes

O Lumo é destinado a profissionais maiores de 18 anos.

## 11. Alterações

Podemos atualizar esta política. Mudanças relevantes serão avisadas no aplicativo ou por e-mail.

## 12. Contato

Fabio Stutt ·fabiostutt@gmail.com
`;

export default function PrivacidadePage() {
  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding-base,16px)]">
      <TitleAction title="Política de Privacidade" href="/login" />
      <MarkdownContent text={CONTENT} />
    </div>
  );
}
