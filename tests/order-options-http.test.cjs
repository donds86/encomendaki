const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto');
const {openDatabase}=require('../backend/database.cjs'),{createApp}=require('../server.cjs');
test('HTTP: referências por item privadas, nascimento fora do acompanhamento e renomeação preserva ficha',async()=>{
 const db=await openDatabase({databaseUrl:'',sqlitePath:':memory:',production:false}),password='Test-'+crypto.randomUUID(),app=await createApp({db,production:false,adminEmail:'options@example.org',adminPassword:password}),server=http.createServer(app.handler);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const root='http://127.0.0.1:'+server.address().port;
 async function req(path,method='GET',body,cookie){const r=await fetch(root+path,{method,headers:{Origin:root,'Content-Type':'application/json',Cookie:cookie||''},body:body?JSON.stringify(body):undefined});return {status:r.status,data:r.headers.get('content-type')?.includes('application/json')?await r.json():await r.arrayBuffer(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
 try{
  const admin=(await req('/api/admin/login','POST',{email:'options@example.org',password})).cookie,companies=[];
  for(let i=0;i<2;i++){const created=await req('/api/platform/tenants','POST',{name:'Loja '+i,owner:'Pessoa',email:'options'+i+'@example.org',slug:'options-'+i,reseller:'direct',plan:'Essencial',status:'Ativa',expires:'2099-12-31',password},admin);assert.equal(created.status,201);const cookie=(await req('/api/login','POST',{email:'options'+i+'@example.org',password})).cookie;companies.push({id:created.data.id,cookie})}
  const {id,cookie}=companies[0],path='/api/tenants/'+id;let own=(await req(path,'GET',null,cookie)).data;
  own.catalog.phone='11999999999';let saved=await req(path+'/catalog','PUT',{version:own.version,catalog:own.catalog},cookie);assert.equal(saved.status,200);
  const ingredient=(await req(path+'/ingredients','POST',{name:'Leite',unit:'g',opening:1000},cookie)).data.id;
  assert.equal((await req(path+'/recipes','POST',{kind:'filling',subject:'Ninho',sizeId:'s10',items:[{ingredientId:ingredient,quantity:100}]},cookie)).status,200);
  const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQ1sAAAAASUVORK5CYII=',line={product:'chocolate',size:'s10',quantity:1,fill:['Ninho'],floors:1,topper:false,alignModel:true,themeImage:png,notes:'Referência do item'},body={name:'Cliente',birthDate:'1990-05-12',delivery:'2099-12-01',pickupTime:'15:00',catalogVersion:saved.data.version,requestKey:crypto.randomUUID(),items:[line,{...line,notes:'Outro item'}]};
  assert.equal((await req('/api/public/options-0/orders','POST',{...body,birthDate:undefined})).status,400);
  const created=await req('/api/public/options-0/orders','POST',body);assert.equal(created.status,201,JSON.stringify(created.data));const order=created.data.order;
  assert.equal(order.items[0].hasThemeImage,true);assert.equal(order.items[0].themeImage,undefined);
  const reference=path+'/orders/'+order.id+'/reference?item=';
  assert.equal((await req(reference+'0','GET',null,cookie)).status,200);assert.equal((await req(reference+'1','GET',null,cookie)).status,200);assert.equal((await req(reference+'2','GET',null,cookie)).status,404);
  assert.equal((await req(reference+'0')).status,401);assert.equal((await req(reference+'0','GET',null,companies[1].cookie)).status,404);
  assert.equal((await req('/api/tenants/'+companies[1].id+'/orders/'+order.id+'/reference?item=0','GET',null,companies[1].cookie)).status,404);
  const tracking=(await req('/api/tracking/'+order.trackingToken)).data.order;assert.equal(tracking.birthDate,undefined);assert.equal(tracking.items[0].notes,undefined);
  const renamed={...saved.data.catalog,fillings:saved.data.catalog.fillings.map(n=>n==='Ninho'?'Ninho cremoso':n)};renamed.fillingSettings['Ninho cremoso']=renamed.fillingSettings.Ninho;delete renamed.fillingSettings.Ninho;
  saved=await req(path+'/catalog','PUT',{version:saved.data.version,catalog:renamed,fillingRename:{from:'Ninho',to:'Ninho cremoso'}},cookie);assert.equal(saved.status,200,JSON.stringify(saved.data));
  assert.equal((await db.query("SELECT subject FROM recipes WHERE tenant_id=$1 AND kind='filling'",[id])).rows[0].subject,'Ninho cremoso');
  assert.equal((await req(path+'/orders','GET',null,cookie)).data.orders[0].items[0].filling,'Ninho');
 }finally{await new Promise(r=>server.close(r));await app.close()}
});
