import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { Headers, RequestOptions ,Http, Response ,ResponseOptions} from '@angular/http';
import { ChatConnectBody } from './message.model';
import 'rxjs/Rx'
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';


export class ChatMessage {
    messageId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    toUserId: string;
    time: number | string;
    message: string;
    status: string;
}

export class UserInfo {
    id: string;
    name?: string;
    avatar?: string;
}

@Injectable()
export class ChatService {

    private baseUrl: string= "https://directline.botframework.com/v3/directline/conversations";
    private serect="RiXqDt97Z8g.cwA.u4M.8EV8JSJn0ip62kmfUGh4eYGBPdhfgyHqqpf_MxNTZ7k";  

    constructor(public http: Http,
                public events: Events) {
    }

    getAuthorization() : Observable<ChatConnectBody> 
    {

    let headers = new Headers({ 'Authorization':'Bearer '+this.serect});

    let options = new RequestOptions({ headers: headers });

    let url = this.baseUrl;
    console.log(url);
    return this.http.post(url, null ,options)
                .map(this.extractData)
                .finally(() => true)
                .catch(this.handleError);


    }    

    mockNewMsg(text) {
        const mockMsg: ChatMessage = {
            messageId: Date.now().toString(),
            userId: '210000198410281948',
            userName: 'Hancock',
            userAvatar: './assets/to-user.jpg',
            toUserId: '140000198202211138',
            time: Date.now(),
            message: text,
            status: 'success'
        };

        setTimeout(() => {
            this.events.publish('chat:received', mockMsg, Date.now())
        }, Math.random() * 1800)
    }

    getMsgList(): Promise<ChatMessage[]> {
        const msgListUrl = './assets/mock/msg-list.json';
        return this.http.get(msgListUrl)
        .toPromise()
        .then(response => response.json().array as ChatMessage[])
        .catch(err => Promise.reject(err || 'err'));
    }

    sendMsg(sendRequest,conversationId) {
         let body = JSON.stringify(sendRequest);

         let headers = new Headers({ 'Authorization':'Bearer '+this.serect});
         headers.append('Content-Type','application/json');

         let options = new RequestOptions({ headers: headers });
         let url = `${this.baseUrl}/${conversationId}/activities`;
         return this.http.post(url, body, options)
                 .map(this.extractData)
                 .catch(this.handleError);
//        return new Promise(resolve => setTimeout(() => resolve(msg), Math.random() * 1000))
//        .then(
//            () => this.mockNewMsg(msg)
//            );
    }

    private extractData(res: Response) {

    let body = res.json();
    return body || { };
    }    

     private handleError (error: any) {
       // In a real world app, we might use a remote logging infrastructure
       // We'd also dig deeper into the error to get a better message

       let errMsg = (error.message) ? error.message :
       error.status ? `${error.status} - ${error.statusText}` : 'Server error';
       console.error(errMsg); // log to console instead
       return Observable.throw(error);
     }    

    getUserInfo(): Promise<UserInfo> {
        const userInfo: UserInfo = {
            id: '140000198202211138',
            name: 'Luff',
            avatar: './assets/user.jpg'
        };
        return new Promise(resolve => resolve(userInfo));
    }

}
