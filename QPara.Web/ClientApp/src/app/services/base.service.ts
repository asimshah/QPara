import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { saveAs } from 'file-saver';

export type ResponseContentType = "arraybuffer" | "blob" | "json" | "text";

export class DownloadedFile {
    filename: string;
    data: Blob;
}
export class DataResult<T> {
    data: T;
    exceptionMessage: string;
    message: string;
    success: boolean;
}
export class ServiceError {
    query: string;
    exception: string;
    message: string;
}

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    let msg = `An error occurred: ${error.error.message}`;
                    console.error(msg);
                    alert(msg);
                } else if (error.status !== 401) {
                    // The backend returned an unsuccessful response code.
                    // (but 401 (unauthorised are allowed as they are handled by the AuthenticationInterceptor)
                    // The response body may contain clues as to what went wrong,
                    let msg = `Server returned code ${error.status}, body was: ${error.error}`;
                    console.error(msg);
                    alert(msg);
                }

                // If you want to return a new response:
                //return of(new HttpResponse({body: [{name: "Default value..."}]}));

                // If you want to return the error on the upper level:
                //return throwError(error);

                // or just return nothing:
                return EMPTY;
            })
        );
    }
}


export abstract class BaseService {
    constructor(protected http: HttpClient, private urlPrefix = "") { }
    protected async getAsync<R>(url: string): Promise<R> {
        let dr = await this.getDataResultAsync<R>(url);
        return new Promise<R>(resolve => resolve(dr.data));
    }
    protected async getDataResultAsync<R>(url: string): Promise<DataResult<R>> {
        let dr = await this.getResponse<R>(url);
        if (!dr.success) {
            this.logError(dr);
        }
        return new Promise<DataResult<R>>(resolve => resolve(dr));
    }
    protected async postAndGetAsync<T, R>(url: string, data: T): Promise<R> {
        let dr = await this.postAndGetDataResultAsync<T, R>(url, data);
        return new Promise<R>(resolve => resolve(dr.data));
    }
    protected async postAndGetDataResultAsync<T, R>(url: string, data: T): Promise<DataResult<R>> {
        let dr = await this.postResponse<T, R>(url, data);
        if (!dr.success) {
            this.logError(dr);
        }
        return new Promise<DataResult<R>>(resolve => resolve(dr));
    }
    protected async downloadFileAsync(url: string) {
        return new Promise<DownloadedFile>(async (resolve, reject) => {
            url = `${this.urlPrefix}/${url}`;
            let response = await this.http.get(url, { responseType: 'blob', observe: 'response' }).toPromise();
            let fileName = this.getFileNameFromResponse(response);
            let df = new DownloadedFile();
            df.filename = fileName;
            df.data = response.body;
            resolve(df);
        });

    }
    protected async postAndDownloadFileAsync<T>(url: string, data: T) {
        return new Promise<DownloadedFile>(async (resolve, reject) => {
            url = `${this.urlPrefix}/${url}`;
            let response = await this.http.post(url, data, { responseType: 'blob', observe: 'response'  }).toPromise();
            let fileName = this.getFileNameFromResponse(response);
            let df = new DownloadedFile();
            df.filename = fileName;
            df.data = response.body;
            resolve(df);
        });
    }
    protected saveFile(filename: string, data: Blob, type: string = 'application/octet-stream') {
        const blob = new Blob([data], { type: type });
        saveAs(data, filename);
    }
    private postResponse<T, R>(url: string, data: T): Promise<DataResult<R>> {
        url = `${this.urlPrefix}/${url}`;
        return this.http.post<DataResult<R>>(url, data).toPromise();
    }
    private getResponse<R>(url: string): Promise<DataResult<R>> {
        url = `${this.urlPrefix}/${url}`;
        return this.http.get<DataResult<R>>(url).toPromise();
    }

    private getFileNameFromResponse(res: HttpResponse<Blob>) {
        const contentDisposition = (res.headers && res.headers.get('content-disposition')) || '';
        const matches = /filename=([^;]+)/ig.exec(contentDisposition);
        const filename = ((matches && matches[1]) || 'untitled').trim();
        return filename;
    }
    private logError<R>(dr: DataResult<R>) {
        if (dr.message && dr.message.length > 0) {
            console.error(`message: ${dr.message}`);
        }
        if (dr.exceptionMessage && dr.exceptionMessage.length > 0) {
            console.error(`exception: ${dr.message}`);
        }
    }

}
