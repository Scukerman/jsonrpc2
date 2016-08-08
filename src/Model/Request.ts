namespace JSONRPC2 {
    export namespace Model {
        export class Request extends ClientRequest {
	        constructor(method: string, params?: any[] | { [ arg: string ]: any; }) {
	        	super(method, params);
		        this.id = JSONRPC2.Helper.GUID.generate();
	        }
        }
    }
}
