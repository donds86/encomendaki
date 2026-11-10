'use strict';
// Only the dedicated commercial demonstration tenant is simulated.
const tenantId='2b623554-365c-4cd7-9a4f-9a834b454b9a';
const phone='5500000000000';
const enabled=t=>t?.id===tenantId&&t?.slug==='demo';
const readOnlyUser=u=>u?.role==='tenant'&&u?.tenant_id===tenantId;
module.exports={tenantId,phone,enabled,readOnlyUser};
