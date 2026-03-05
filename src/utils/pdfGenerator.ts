import jsPDF from 'jspdf';
import { Lead } from '../types';

interface ImageResult {
  data: string;
  width: number;
  height: number;
  ratio: number;
}

const loadImage = async (url: string): Promise<ImageResult | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        resolve({
          data: base64,
          width: img.width,
          height: img.height,
          ratio: img.width / img.height
        });
      };
      img.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const generateContract = async (lead: Lead, contractData: any) => {
  const doc = new jsPDF();
  const lineHeight = 6;
  const margin = 20;
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - (margin * 2);
  
  // Load images
  const headerImg = await loadImage('https://i.imgur.com/pcnXKBK.jpeg');
  const signatureImg = await loadImage('https://i.imgur.com/BXMTe2D.jpeg');

  // Header Dimensions (approximate conversion from px to mm assuming 96dpi)
  // 40px ~= 11mm
  // 120px ~= 32mm
  // 20px ~= 6mm
  // 30px ~= 8mm
  const headerMarginTop = 11;
  const logoMaxWidth = 32;
  const titleMarginTop = 6;
  const headerMarginBottom = 8;
  
  let logoHeight = 0;
  if (headerImg) {
    logoHeight = logoMaxWidth / headerImg.ratio;
  }

  // Function to draw the fixed header (Logo)
  const drawHeader = () => {
    if (headerImg) {
      const x = (pageWidth - logoMaxWidth) / 2;
      doc.addImage(headerImg.data, 'JPEG', x, headerMarginTop, logoMaxWidth, logoHeight);
    }
    return headerMarginTop + logoHeight;
  };

  let y = margin;

  // Helper to add text and advance cursor
  const addText = (text: string, fontSize = 11, fontStyle = 'normal', align = 'left', customLineHeight = lineHeight) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    const splitText = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    if (y + (splitText.length * customLineHeight) > pageHeight - margin) {
      doc.addPage();
      const headerBottom = drawHeader();
      y = headerBottom + headerMarginBottom + 10; // Start below header on new pages
    }
    
    let x = margin;
    if (align === 'center') {
      x = pageWidth / 2;
    } else if (align === 'right') {
      x = pageWidth - margin;
    }

    doc.text(splitText, x, y, { align: align as any });
    y += (splitText.length * customLineHeight) + 2;
  };

  // --- Content Start ---
  
  // Draw Header on First Page
  const headerBottom = drawHeader();
  y = headerBottom + titleMarginTop;

  // Title (Part of the requested header structure)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇO', pageWidth / 2, y, { align: 'center' });
  
  y += 8; // Title height approx
  y += headerMarginBottom;

  addText('Por este presente instrumento particular de prestação de serviços, as partes:');
  y += 5;

  // Parties
  addText('CONEXAO ASSESSORIA LTDA, regularmente inscrita no CNPJ sob o nº 37.423.637/0001-09, com sede social na R. Benjamin Pereira, 246 – Jacana, São Paulo – SP, 02274-000, doravante denominado CONTRATADO, e;', 10, 'bold');
  
  const clientText = `${lead.name.toUpperCase()}, ${contractData.maritalStatus || 'SOLTEIRO(A)'}, inscrito (a) no CPF sob o Nº ${lead.cpf} residente e domiciliada ${lead.address}, ${contractData.number || 'S/N'} – ${contractData.neighborhood || 'BAIRRO'} ${contractData.city || 'CIDADE'}-${contractData.state || 'UF'} – CEP: ${contractData.zip || '00000-000'}, doravante denominado CONTRATANTE;`;
  addText(clientText, 10, 'bold');
  y += 5;

  addText('Tem entre si pactuado um o presente contrato de prestação de serviços para INTERMEDIAÇÃO BANCÁRIA, mediante renegociação extrajudicial e/ou judicial em contratos de financiamentos, empréstimos e/ou arrendamento mercantil em nome do (a) CONTRATANTE face ao banco/financeira credor (a).');
  y += 5;

  // Clauses
  addText(`CLÁUSULA 1ª: O contrato a ser intermediado trata-se de financiamento com alienação fiduciária ao credor ${contractData.creditor || '____________________'}`);
  addText('PARAGRÁFO ÚNICO: ESTE CONTRATO TORNA-SE VÁLIDO NO ATO DE SUA ASSINATURA, ENTRANDO EM VIGÊNCIA SOMENTE MEDIANTE PAGAMENTO INTEGRAL DO SEU VALOR.', 10, 'bold');
  y += 5;

  addText('CLÁUSULA 2ª: Para prestar o serviço objeto deste contrato fica a CONTRATADA obrigada a:');
  addText('a) Entrar em contato com os credores localizados para diligenciar, mediante a renegociação extrajudicial, a redução de juros e/ou taxas e tarifas cobradas em detrimento do (a) CONTRATANTE;');
  addText('b) Apresentar ao CONTRATANTE as vantagens eventualmente obtidas através da citada renegociação extrajudicial;');
  addText('c) Caso seja interesse do (a) CONTRATANTE, promover a implementação das medidas necessárias para quitação dos débitos verificados.');
  y += 5;

  addText('CLÁUSULA 3ª: O (a) CONTRATANTE declara estar ciente que o serviço objeto deste contrato é de meio, não podendo a CONTRATADA garantir êxito nas ações judiciais e extrajudiciais em favor do primeiro.');
  addText(`PARAGRAFO UNICO: Toda e qualquer redução/vantagem obtida pela CONTRATADA em favor do (a) CONTRATANTE será notificado através do e-mail ${lead.email} e telefone ${lead.phone} respeitando as condições obtidas junto ao credor, bem como, indicando o prazo para que o (a) CONTRATANTE se manifeste sobre a intenção de acordo, sendo que no silêncio a CONTRATADA entenderá que o (a) CONTRATANTE declinou a proposta.`);
  y += 5;

  addText('CLÁUSULA 4ª: Após receber a notificação referente quaisquer das renegociações o (a) CONTRATANTE poderá, dentro do prazo indicado, informar sua anuência com a proposta obtida, a CONTRATADA por sua vez promoverá a implementação das medidas necessárias para quitação do(s) débito(s), ocasião em que a CONTRATADA dará por encerrada a prestação de serviços aqui pactuada.');
  addText('PARÁGRAFO ÚNICO: Uma vez confirmada à intenção de quitação do débito pelo (a) CONTRATANTE este deverá fazê-la dentro do prazo indicado pela CONTRATADA. Se a quitação não ocorrer no citado prazo o (a) CONTRATANTE desde já declara estar ciente de que a CONTRATADA não se responsabiliza pelo valor alcançado, e caso tenha decorrido o prazo descrito na cláusula 14ª a CONTRATADA também não terá a obrigação de continuar a renegociação.');
  y += 5;

  addText('CLÁUSULA 5ª: O (a) CONTRATANTE declara neste ato estar plenamente ciente de que não pode deixar de pagar as parcelas do contrato que celebrou com a instituição financeira e que se o fizer, por sua vontade, deverá manter uma reserva financeira para pagamento da proposta obtida pela CONTRATADA, ciente das medidas judiciais e extrajudiciais que o credor pode empregar para retomada do veículo ou cobrança do crédito.');
  addText('PARÁGRAFO ÚNICO: O (a) CONTRATANTE declara ainda estar ciente de que se estiver ou vier a ficar inadimplente com relação aos pagamentos devidos à instituição financeira credora, a renegociação extrajudicial, ou mesmo eventual processo para revisão de juros e restituição de taxas, não impede que contra ele (a) seja movida ação de busca e apreensão/reintegração de posse/imissão na posse que porventura pode acarretar na perda do bem adquirido por meio do contrato bancário.');
  y += 5;

  addText('CLÁUSULA 6ª: No ato da assinatura deste contrato o (a) CONTRATANTE entrega a CONTRATADA declaração com informações imprescindíveis para a realização do serviço descrito na cláusula 1ª, tais como se já celebrou ou quebrou acordo referente ao(s) débito(s) que serão renegociados extrajudicialmente, etc.');
  addText('PARÁGRAFO ÚNICO: O presente contrato será considerado rescindido, independentemente de notificação extrajudicial ou judicial, caso a CONTRATADA constate que o (a) CONTRATANTE prestou falsas informações na declaração descrita na cláusula anterior, arcando o (a) CONTRATANTE com os prejuízos decorrentes da prestação de declaração inverídica.');
  y += 5;

  addText('CLÁUSULA 7ª: O (a) CONTRATANTE se compromete neste ato a fornecer à CONTRATADA todos os documentos e informações que lhe forem solicitados para o desenvolvimento dos serviços previsto da cláusula 1º. As informações e documentos apresentados pelo (a) CONTRATANTE são de sua exclusiva responsabilidade, cabendo ao (a) CONTRATANTE a responsabilidade pelas referidas informações e documentos em qualquer esfera.');
  addText('PARÁGRAFO ÚNICO: O (a) CONTRATANTE declara neste ato a ciência de que os serviços contratados somente serão prestados após o fornecimento LEGIVEL e SEM RASURAS de toda a documentação e informações previstas no caput.');
  y += 5;

  addText('CLÁUSULA 8ª: No ato da assinatura deste contrato a CONTRATADA fornecerá ao (a) CONTRATANTE procuração que deverá ser assinada com reconhecimento de firma POR AUTENTICIDADE pelo (a) CONTRATANTE no prazo de 15 (quinze) dias contados da assinatura deste termo, e entregue à CONTRATADA em sua sede ou por correios.');
  addText('§ 1° O (a) CONTRATANTE reconhece que citada procuração é de suma importância para a prestação dos serviços descrito na cláusula 1º deste contrato, e que o não fornecimento do documento, ou o fornecimento em condições inviáveis para o uso impossibilitará a realização dos serviços sem culpa da CONTRATADA.');
  addText('§ 2° A não entrega da procuração assinada ou a entrega em condições não adequadas, será notificada pela CONTRATADA e deverá ser corrigido em no máximo 03 (Três) dias. Caso não ocorra a correção a necessidade apontada, será o presente contrato extinto por culpa exclusiva do contratante, não fazendo ele jus a nenhum valor que tenha efetuado.');
  y += 5;

  addText('CLÁUSULA 9ª: O (a) CONTRATANTE se obriga neste ato a manter seus dados, tais como endereço residencial, telefone e e-mail sempre atualizados no cadastro de informações da CONTRATADA, eximindo-a de qualquer responsabilidade por fato decorrente de sua não localização caso os dados estejam desatualizados.');
  addText('PARAGRAFO PRIMEIRO: Declara o (a) CONTRATANTE estar ciente que em caso de falta de contato pelo período igual ou maior há 90 (noventa) dias, por motivos desconhecidos ou não previamente informados, a CONTRATADA suspenderá o serviço pelo mesmo prazo. Decorrido 90 (noventa) dias de suspensão contratual sem que haja a manifestação do (a) CONTRATANTE, o contrato será cancelado pela CONTRATADA sem devolução do valor pago, não tendo o (a) CONTRATANTE direitos de reaver a quantia ou serviço.');
  addText('PARÁGRAFO SEGUNDO: As informações sobre os serviços prestados pela CONTRATADA serão prestadas somente à pessoa do (a) CONTRATANTE, sendo que em caso de informações ao TERCEIRO INTERESSADO sobre os serviços prestados pela CONTRATADA somente serão disponibilizados mediante a indicação expressa do (a) CONTRATANTE com a apresentação dos dados para cadastro do TERCEIRO INTERESSADO. Se porventura o (a) CONTRATANTE quiser revogar a autorização de recebimento de informações a terceiros deverá comunicar expressamente a CONTRATADA desta intenção.');
  y += 5;

  addText('CLÁUSULA 10ª: As notificações descritas nas cláusulas 3ª e 4ª deste contrato serão feitas prioritariamente por e-mail, no endereço digital fornecido pelo (a) CONTRATANTE, sendo de sua inteira responsabilidade acompanhar seu correio eletrônico, isentando a CONTRATADA de qualquer responsabilidade por eventuais perdas de prazo decorrentes do não acompanhamento do e-mail.');
  y += 5;

  addText('CLÁUSULA 11ª: O (a) CONTRATANTE declara ciência de que as negociações serão realizadas exclusivamente pela CONTRATADA, sendo que sua intervenção junto aos seus credores poderá influenciar, em forma negativa nas estratégias negociais empregadas pela CONTRATADA. Neste sentido declara o (a) CONTRATANTE que se eventual prejuízo às negociações forem identificados por sua intervenção, ficará a CONTRATADA isenta de qualquer responsabilidade pelo atraso nos resultados, bem como, pelo insucesso da negociação outrora iniciada, visto pelo que se orienta a não interferir na negociação, respeitando até mesmo a natureza da contratação e obrigações da CONTRATADA constante neste contrato.');
  addText('PARÁGRAFO PRIMEIRO: Se o (a) CONTRATANTE infringir o constante no caput desta cláusula, causando prejuízo às atividades da CONTRATADA no tocante às negociações, objeto do contrato, imagem e ou relacionamento com o credor, o presente contrato de prestação será rescindido, não tendo o (a) CONTRATANTE direito à restituição dos valores pagos a CONTRATADA devendo, ainda, o (a) CONTRATANTE arcar com multa equivalente a 30% (trinta por cento) do valor fixado a título de honorários pagos pela prestação de serviços deste contrato.');
  addText('PARÁGRAFO SEGUNDO: Caso haja, por parte do CONTRATANTE, abertura de reclamação no órgão PROCON ou nos sites: google.com.br e/ou reclameaqui.com.br, durante a vigência do contrato celebrado, este será rescindido unilateralmente, sem a restituição de valores pagos anteriormente. Para tais manifestações a CONTRATADA disponibiliza de canal próprio para o serviço de atendimento ao consumidor (SAC) na clausula 18ª deste contrato.');
  y += 5;

  // Helper to format date correctly (avoiding timezone issues)
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('pt-BR');
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  const getFormattedDateLong = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  addText(`CLÁUSULA 12ª: A título de honorários pela prestação dos serviços objeto deste contrato o (a) CONTRATANTE pagará a importância de R$${contractData.value || '0,00'} que serão pagos nas seguintes condições:`);
  addText(`${contractData.paymentMethod || 'À VISTA'} R$${contractData.value || '0,00'} (${contractData.installments || '1'}) ${getFormattedDate(contractData.date)}`);
  y += 5;

  addText('PARÁGRAFO PRIMEIRO: Caso tenha sido avençado entre as partes pagamento parcelado em boleto e/ou depósitos, transferências ou pix, a prestação de serviços só será iniciada após a quitação do valor integral estipulado e, em caso de inadimplência, o (a) CONTRATANTE arcará com juros de mora de 1% ao mês, multa de 2% sobre a parcela vencida e correção monetária, autorizando desde já que a CONTRATADA envie boleto bancário com o valor acrescido dos encargos da mora.');
  addText('PARÁGRAFO SEGUNDO: Neste ato o (a) CONTRATANTE declara estar ciente de que é de sua responsabilidade o pagamento de custas e emolumentos, taxas, honorários para elaboração de laudos, honorários advocatícios, entre outros que se fizerem necessários para a prestação dos serviços contratados, as quais correrão por sua conta e sem que haja relação ao valor descrito no caput desta clausula. O (a) CONTRATANTE declara ainda ter ciência de que a CONTRATADA não antecipará os referidos pagamentos em hipótese alguma.');
  y += 5;

  addText('CLÁUSULA 13ª: O (a) CONTRATANTE declara estar ciente de que o prazo MÉDIO para realização do serviço e renegociações extrajudiciais é de 120 (Cento e vinte) dias úteis contados da efetiva entrega dos documentos constante da cláusula 7ª deste contrato.');
  addText('PARÁGRAFO PRIMEIRO: Decorrido o prazo descrito no caput desta clausula, tendo a CONTRATADA apresentado propostas com 51% ou mais de redução sobre o montante devido, caso o (a) CONTRATANTE tenha rejeitado as propostas notificadas ou tenha se mantido silente quanto a elas, o presente contrato será rescindido imediatamente, pelo cumprimento das obrigações nele avençadas, independentemente de notificação judicial ou extrajudicial, não podendo o (a) CONTRATANTE nada reclamar a, e/ou sobre a, CONTRATADA.');
  addText('PARÁGRAFO SEGUNDO: Ressalva-se que o prazo citado no Caput desta Cláusula refere- se apenas ao Processo Extrajudicial. Em caso da necessidade de Medidas Judiciais, havendo prazos determinados, estes serão mencionados em termo aditivo que, obrigatoriamente, antecederá qualquer processo judicial a ser proposto pela CONTRATADA.');
  y += 5;

  addText('CLÁUSULA 14ª: No caso de êxito na prestação de serviços e a efetiva reabilitação de crédito mediante o pagamento do saldo devedor ao credor, o prazo para baixa junto aos órgãos de proteção de crédito, se necessário, será de 30 (trinta) dias úteis contados do pagamento efetuado pelo (a) CONTRATANTE, sendo está uma OBRIGAÇÃO EXCLUSIVA DO CREDOR citado na clausula 1ª deste contrato.');
  y += 5;

  addText('CLÁUSULA 15ª: O (a) CONTRATANTE declara neste ato que tem plena ciência de que de forma alguma a CONTRATADA comprará ou pagará a(s) dívida(s) que serão objeto(s) de renegociação extrajudicial neste contrato, bem como que a responsabilidade sobre tal pagamento cabe somente ao (a) CONTRATANTE.');
  y += 5;

  addText('CLÁUSULA 16ª: O (a) CONTRATANTE declara estar ciente que só haverá devolução do valor pago à CONTRATADA para desenvolvimento do serviço constante neste contrato, se comprovado defeito na prestação de serviço da CONTRATADA. Portanto, neste caso CONTRATADA se compromete a restituir ao (a) CONTRATANTE os valores que este eventualmente tenha pagado a ela caso não haja a prestação dos serviços contratados nos termos da cláusula 1º deste contrato.');
  y += 5;

  addText('CLÁUSULA 17ª: Caso seja necessário o ingresso ou defesa em ação judicial, a CONTRATADA possui profissionais habilitados para este fim, devendo as partes assinar aditivo ao presente contrato para formalizar a questão.');
  addText('PARAGRAFO UNICO: Ficará eleito o foro do domicílio da CONTRATADA, para dirimir questões oriundas do presente contrato. CONEXAO ASSESSORIA LTDA, regularmente inscrita no CNPJ sob o nº 37.423.637/0001-09');
  y += 5;

  addText('CLÁUSULA 18ª: Todos e quaisquer contatos efetuados pela CONTRATADA ao (a) CONTRATANTE serão por meio dos números telefônicos 11948786367, por carta registrada, e/ou por e-mails com domínio @conexaoassessoria.com ou pelo SAC 11948786367 portanto deverá o (a) CONTRATANTE desconsiderar outros tipos de contatos e envios, não tendo a CONTRATADA responsabilidade por eventuais desconfortos e/ou prejuízos.');
  y += 5;

  addText('CLÁUSULA 19ª: O presente contrato tem validade a partir da assinatura das partes, entrando em Vigor na data em que se comprovar o recebimento integral dos valores acordados, conforme previsto no Parágrafo 1° da Cláusula 12ª do presente Contrato.');
  y += 5;

  addText('Assim sendo, para tornar o presente contrato TÍTULO EXECUTIVO deverão ser acrescidos espaços para assinatura de duas testemunhas, bem como indicação de nome e número do Cédula de identidade - RG, conforme a seguir:');
  y += 15;

  // Date and Signature
  const formattedDate = `São Paulo, ${getFormattedDateLong(contractData.date)}`;
  
  addText(formattedDate, 10, 'normal', 'left');
  y += 20;

  // Signatures
  // Check if we need a new page for signatures
  if (y + 60 > pageHeight - margin) {
    doc.addPage();
    const headerBottom = drawHeader();
    y = headerBottom + headerMarginBottom + 10;
  }

  // Client Signature
  doc.line(20, y, 90, y);
  doc.text(lead.name.toUpperCase(), 20, y + 5);
  
  // Company Signature with Image
  if (signatureImg) {
    // Adjust position to align with the line
    doc.addImage(signatureImg.data, 'JPEG', 110, y - 25, 60, 25);
  }
  doc.line(110, y, 180, y);
  doc.text('CONEXAO ASSESSORIA LTDA', 110, y + 5);

  doc.save(`Contrato_${lead.name.replace(/\s+/g, '_')}.pdf`);
};
