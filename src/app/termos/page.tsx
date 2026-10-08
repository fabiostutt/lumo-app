import TitleAction from "@/components/TitleAction";
import MarkdownContent from "@/components/MarkdownContent";

const CONTENT = `
# Termos de Serviço

Última atualização: 8 de outubro de 2026

Estes termos regulam o uso do Lumo, operado por [NOME OU RAZÃO SOCIAL], [CNPJ/CPF]. Ao criar uma conta ou usar o aplicativo, você concorda com eles.

## 1. O que é o Lumo

Um aplicativo para profissionais autônomos organizarem agenda, clientes e confirmações de sessões, incluindo o envio de mensagens por WhatsApp.

## 2. Conta

- Você precisa ter 18 anos ou mais.
- O acesso é feito pela sua conta Google. Você é responsável por manter essa conta segura e por tudo que acontece nela.
- As informações que você fornece devem ser verdadeiras e atualizadas.

## 3. Planos e pagamento

- **Free:** até 5 clientes cadastrados.
- **Pro:** clientes ilimitados e recursos adicionais, cobrado de forma mensal ou anual, com 14 dias de teste gratuito quando disponível.
- Os valores vigentes aparecem na tela de planos. Os pagamentos são processados pelo Stripe.
- Você pode cancelar a qualquer momento. O acesso ao Pro continua até o fim do período já pago. Reembolsos seguem a legislação aplicável, incluindo o direito de arrependimento do Código de Defesa do Consumidor, quando for o caso.
- Ao fim do teste ou de uma assinatura cancelada, a conta passa ao plano Free. Seus dados são mantidos, mas o cadastro de novos clientes respeita o limite do plano.

## 4. Suas responsabilidades

Você se compromete a:
- Cadastrar apenas dados de clientes que tenha autorização ou base legal para tratar.
- Enviar mensagens apenas a pessoas com quem tenha relação de atendimento, sem spam ou conteúdo promocional não solicitado.
- Cumprir as políticas do WhatsApp e da Meta, que valem para as mensagens enviadas pelo Lumo.
- Não usar o Lumo para atividades ilegais, abusivas ou que prejudiquem terceiros ou o serviço.

## 5. Mensagens por WhatsApp

O envio depende de serviços de terceiros (Meta). Não garantimos que cada mensagem seja entregue, porque a entrega pode ser limitada por regras da plataforma, pela qualidade do número ou por falhas externas. Recomendamos confirmar com o cliente por outro meio quando a sessão for importante.

## 6. Disponibilidade

Trabalhamos para manter o Lumo disponível, mas podem ocorrer interrupções por manutenção ou falhas de terceiros. Podemos alterar ou descontinuar funcionalidades, avisando com antecedência razoável quando o impacto for relevante.

## 7. Propriedade intelectual

O Lumo, sua marca e seu código pertencem a [NOME OU RAZÃO SOCIAL]. Os dados que você cadastra continuam sendo seus.

## 8. Encerramento

Você pode encerrar sua conta quando quiser. Podemos suspender ou encerrar contas que violem estes termos, com aviso quando possível.

## 9. Limitação de responsabilidade

Na extensão permitida em lei, o Lumo não responde por prejuízos indiretos, como perda de atendimentos por falha na entrega de uma notificação. Nossa responsabilidade total fica limitada ao valor pago por você nos últimos 12 meses.

## 10. Privacidade

O tratamento de dados pessoais está descrito na Política de Privacidade.

## 11. Alterações

Podemos atualizar estes termos. Mudanças relevantes serão avisadas no aplicativo ou por e-mail. Continuar usando o Lumo depois do aviso significa aceitar a nova versão.

## 12. Lei aplicável e contato

Estes termos seguem a lei brasileira, e o foro é o de Rio de Janeiro/RJ]. Dúvidas:  fabiostutt@gmail.com
`;

export default function TermosPage() {
  return (
    <div className="flex w-full flex-col gap-[var(--slot-gap-base,24px)] bg-[var(--surface-base,white)] p-[var(--screen-padding-base,16px)]">
      <TitleAction title="Termos de Serviço" href="/login" />
      <MarkdownContent text={CONTENT} />
    </div>
  );
}
