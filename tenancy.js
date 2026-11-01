function brandText(value){return typeof value==='string'?value.replace(/cake delivery/gi,'EncomendAki'):value}
let platform={active:null,tenants:[],resellers:[]};
let sessionUser=null,catalogVersion=0,publicStore=false;
function activeTenant(){return platform.tenants.find(t=>t.id===platform.active)||{name:'EncomendAki',id:null,status:'Inativa',expires:''}}
function licenseValid(t=activeTenant()){return t.status==='Ativa'&&t.expires>=today()}
function readTenant(){return null}
async function persistTenant(data,options={}){if(publicStore||!platform.active)throw Error('Abra uma empresa para salvar');const snapshot=structuredClone(data);const result=await api('/api/tenants/'+platform.active+'/catalog',{method:'PUT',body:{version:catalogVersion,catalog:snapshot,...options}});catalogVersion=result.version;Object.assign(db,result.catalog)}
