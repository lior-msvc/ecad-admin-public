import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ModalDialogsService } from '../services/modal-dialogs.service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor  implements HttpInterceptor {

// default constructor
constructor(private modalDialogsService: ModalDialogsService) { }

intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
return next.handle(request)
        .pipe(
          tap(
            event => {
              if (event instanceof HttpResponse) {
                // successful http response (except login request)
                if (event.body["ResponseType"] == "Response-Error")
                {
                  // got logical error from server
                  let errMsg = `Error (type = ${event.body["Error"]["ErrorType"]}): ${event.body["Error"]["ErrorMessage"]}`;
                  
                  // write error to console
                   console.error("http error (api error): ", event.body);

                  // show error message
                  this.modalDialogsService.showError(errMsg, "API Error");
                }
              }
            },
          ),

          // got http error
          catchError( (error: HttpErrorResponse) => {   
             let errMsg = '';
             // Client Side Error
             if (error.error instanceof ErrorEvent) {	
               errMsg = `Error (type = ${error.type}): ${error.error.message}`;
             } 
             else {  // Server Side Error
               errMsg = `Error Code: ${error.status},  Message: ${error.message}`;
             }
             
             // write error to console
             console.error("http error: ", error);

             // show error message
             this.modalDialogsService.showError(errMsg, "HTTP Error");

             // return an observable
             return throwError(errMsg);
           })
        )
}
} 