const {test}=require('node:test');
const assert=require('node:assert/strict');
const {whatsappMessage}=require('../server.cjs');
const general='50% de entrada e 50% na retirada.';
function message(payments){const order={id:'12345678-0000',name:'Cliente',delivery:'2099-12-01',value:100,payment:general,items:payments.map(payment=>({quantity:1,product:'Produto',size:'Unidade',value:50,payment}))};return new URL(whatsappMessage(order,'5511999999999','https://example.org/pedido/token')).searchParams.get('text')}
test('WhatsApp exibe condições gerais uma vez, mesmo com vários itens que as herdam',()=>{const text=message([general,' '+general+' ']);assert.equal(text.split(general).length-1,1);assert.ok(text.indexOf('Pagamento:')>text.indexOf('TOTAL:'));assert.ok(text.includes('https://example.org/pedido/token'))});
test('WhatsApp preserva condições específicas de cada produto',()=>{const text=message(['Pagamento integral antecipado.',general]);assert.equal(text.split(general).length-1,1);assert.ok(text.includes('Pagamento: Pagamento integral antecipado.'))});
