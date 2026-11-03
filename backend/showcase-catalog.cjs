'use strict';
const fs=require('node:fs'),path=require('node:path'),{validateCatalog}=require('./domain.cjs');
const manifest=require('../demo-assets/catalog-v1/manifest.json');
const categoryNames=['Bolos de Festa','Bolos Caseiros','Doces por Cento','Tortas e Sobremesas','Salgados para Festas','Kits e Complementos'];
const descriptions=[
 'Massa de chocolate, ganache cremosa e decoração com morangos.',
 'Massa branca, creme de morango e acabamento delicado em tons rosados.',
 'Massa de baunilha, creme suave e flores decorativas em tons pastel.',
 'Massa red velvet e cobertura cremosa com decoração de farelos vermelhos.',
 'Massa cítrica, creme de limão e decoração com raspas e fatias de limão.',
 'Bolo de fubá macio para acompanhar o café da tarde.',
 'Bolo de laranja com calda cítrica e massa leve.',
 'Bolo de cenoura com cobertura generosa de chocolate.',
 'Bolo de coco com cobertura branca e coco ralado.',
 'Bolo de milho dourado com textura caseira e sabor suave.',
 'Brigadeiros de chocolate com granulado fino, em forminhas brancas.',
 'Docinhos de coco cobertos com coco ralado e um toque de cravo.',
 'Docinhos de leite em pó com acabamento delicado.',
 'Docinhos rosados de morango com pequenas pérolas de açúcar.',
 'Docinhos de nozes com cobertura branca e meia noz decorativa.',
 'Base crocante, creme de limão e merengue levemente tostado.',
 'Torta de mousse de chocolate com ganache e raspas decorativas.',
 'Cheesecake cremoso com calda de frutas vermelhas.',
 'Torta de banana, creme de caramelo e chantilly com cacau.',
 'Sobremesa em camadas de creme de baunilha e biscoitos de chocolate.',
 'Mini coxinhas com recheio de frango e casquinha dourada.',
 'Bolinhas crocantes com recheio de queijo.',
 'Mini risoles de massa crocante e recheio cremoso.',
 'Mini esfihas abertas com massa assada e recheio temperado.',
 'Mini quiches com recheio de queijo e alho-poró.',
 'Composição ilustrativa com bolo pequeno, 30 docinhos e 50 salgados.',
 'Caixa presente com 12 docinhos variados e dois mini brownies.',
 'Caixa com seis brownies de chocolate de cobertura delicadamente crocante.',
 'Conjunto ilustrativo com dez velas coloridas para complementar a festa.',
 'Topo decorativo com flores, estrelas e corações em papel colorido.'
];
function build(existing,{imageReader=file=>fs.readFileSync(file)}={}){const catalog=structuredClone(existing),classes=categoryNames.map((name,i)=>({id:'demo-v1-class-'+(i+1),name}));catalog.productClasses=catalog.productClasses||[];for(const c of classes){if(catalog.productClasses.some(old=>old.id===c.id||old.name.toLowerCase()===c.name.toLowerCase()))throw Error('Uma categoria de demonstração já existe; não substituir dados');catalog.productClasses.push(c)}
 const demoFillings=['Creme de Baunilha Demo','Ganache Demo','Creme de Frutas Demo'];if(catalog.fillings.some(f=>demoFillings.includes(f)))throw Error('Recheios de demonstração já existentes; não substituir');catalog.fillings.push(...demoFillings);catalog.fillingPrices={...catalog.fillingPrices,...Object.fromEntries(demoFillings.map((f,i)=>[f,[0,8,6][i]]))};catalog.fillingSettings={...catalog.fillingSettings,...Object.fromEntries(demoFillings.map((f,i)=>[f,{active:true,available:true,hasAdditional:i>0}]))};
 const products=manifest.items.map((item,i)=>{if(catalog.products.some(p=>p.id===item.id))throw Error('Produto de demonstração já cadastrado; não substituir');const category=Math.floor(i/5),base={id:item.id,name:item.name,desc:descriptions[i]+' Produto fictício para demonstração. Imagem ilustrativa.',price:item.price,photo:'data:image/jpeg;base64,'+imageReader(path.join(__dirname,'../demo-assets/catalog-v1',item.imageFile)).toString('base64'),color:'#e9a9bf',active:true,available:true,classId:classes[category].id,relatedProducts:[]},guide='Exemplo fictício de catálogo para apresentação. Valores e imagens são demonstrativos.';let config={type:'simple',guide};
 if(category===0)config={type:'cake',guide,theme:true,fillings:true,floors:false,topper:true,topperPrice:18,included:2,max_selected:1,extra:8,sizePricesAreFinal:true,sizes:[[12,'6 a 8 fatias',0],[15,'12 a 15 fatias',45],[20,'20 a 25 fatias',95]].map(([cm,serves,extra])=>({id:item.id+'-s'+cm,name:cm+' cm',serves,price:item.price+extra})),fillingOptions:Object.fromEntries(catalog.fillings.map(f=>[f,{enabled:demoFillings.includes(f),bySize:{}}]))};
 if(category===1||category===3)config={type:'custom',guide,sizes:[{id:item.id+'-p',name:'Pequeno',serves:category===1?'6 a 8 porções':'8 porções',price:item.price},{id:item.id+'-g',name:'Grande',serves:category===1?'12 a 16 porções':'16 porções',price:Math.round(item.price*1.65)}],fields:[{id:'acabamento',label:'Acabamento',type:'select',required:true,options:['Clássico','Com mensagem de celebração']},{id:'mensagem',label:'Mensagem decorativa (opcional)',type:'text',required:false}]};
 if(category===2||category===4)config={type:'sweets',guide,pack:100,increment:25,maxFlavors:i===10||i===20?4:1,flavors:i===10?[item.name,'Baunilha Demo','Coco Demo','Morango Demo']:i===20?[item.name,'Queijo Demo','Vegetal Demo','Temperos Demo']:[item.name],fields:[{id:'embalagem',label:'Apresentação',type:'select',required:true,options:category===2?['Forminhas brancas','Forminhas coloridas']:['Bandeja para festa','Caixa para transporte']}]};
 if(i===25)config={type:'custom',guide,theme:true,sizes:[{id:item.id+'-10',name:'Kit para 10 pessoas',serves:'Bolo + 30 doces + 50 salgados',price:249},{id:item.id+'-20',name:'Kit para 20 pessoas',serves:'Bolo + 60 doces + 100 salgados',price:449}],fields:[{id:'ocasiao',label:'Estilo da comemoração',type:'select',required:true,options:['Infantil','Clássico','Colorido']}]};
 if(i===26)config={type:'custom',guide,fields:[{id:'laco',label:'Cor do laço',type:'select',required:true,options:['Rosa','Azul','Dourado']},{id:'cartao',label:'Mensagem do cartão (opcional)',type:'text',required:false}]};
 if(i===29)config={type:'custom',guide,theme:true,fields:[{id:'nome',label:'Nome ou frase no topo',type:'text',required:true},{id:'cor',label:'Paleta de cores',type:'select',required:true,options:['Pastel','Vibrante','Dourado e branco']}]};return {...base,orderConfig:config}});
 for(const [i,p] of products.entries())p.relatedProducts=i<25?[products[28].id,products[29].id]:i===25||i===26?[products[27].id,products[28].id]:[];catalog.products.push(...products);catalog.store={...existing.store};if(!catalog.store.logo)catalog.store.logo='data:image/png;base64,'+imageReader(path.join(__dirname,'../demo-assets/catalog-v1/logo.png')).toString('base64');if(!catalog.store.banner)catalog.store.banner='data:image/jpeg;base64,'+imageReader(path.join(__dirname,'../demo-assets/catalog-v1/banner.jpg')).toString('base64');const clean=validateCatalog(catalog),newIds=new Set(products.map(p=>p.id)),preserved={...existing,store:{...existing.store,logo:catalog.store.logo,banner:catalog.store.banner},products:[...existing.products,...clean.products.filter(p=>newIds.has(p.id))],productClasses:[...(existing.productClasses||[]),...classes],fillings:[...existing.fillings,...demoFillings],fillingPrices:{...existing.fillingPrices,...Object.fromEntries(demoFillings.map((f,i)=>[f,[0,8,6][i]]))},fillingSettings:{...existing.fillingSettings,...Object.fromEntries(demoFillings.map((f,i)=>[f,{active:true,available:true,hasAdditional:i>0}]))}};return {catalog:preserved,summary:{newProducts:products.length,newCategories:classes.length,newFillings:demoFillings.length,logoAdded:!existing.store?.logo,bannerAdded:!existing.store?.banner,images:products.filter(p=>p.photo).length,totalProducts:clean.products.length}}}
module.exports={build,categoryNames,manifest};
