import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { Events, Content, TextInput } from 'ionic-angular';
import { ChatService, ChatMessage, UserInfo } from "../../providers/chat-service";
import { ChatConnectBody ,SendRequest ,ChatResponse,ReceiveMessage} from '../../providers/message.model';

@IonicPage()
@Component({
    selector: 'page-chat',
    templateUrl: 'chat.html',
})
export class Chat {

    @ViewChild(Content) content: Content;
    @ViewChild('chat_input') messageInput: TextInput;
    msgList: ChatMessage[] = [];
    user: UserInfo;
    toUser: UserInfo;
    editorMsg = '';
    showEmojiPicker = false;
    public chatConnectBody : ChatConnectBody = null;    
    public messageArray = [];
jjj
    constructor(public navParams: NavParams,
                public chatService: ChatService,
                public events: Events,) {
        // Get the navParams toUserId parameter
        this.toUser = {
            id: navParams.get('toUserId'),
            name: navParams.get('toUserName')
        };
        // Get mock user information
        this.chatService.getUserInfo()
        .then((res) => {
            this.user = res
        });

        this.chatService.getAuthorization().timeout(120000).subscribe(result =>  { 
            console.log(result);
            this.chatConnectBody= result;
//            this.receiveMessage();
            },
             err => {
               console.log(err);
            }
        );


    }


   receiveMessage() {    
    var msg = {
   };
    let that = this;
    var exampleSocket = new WebSocket(this.chatConnectBody.streamUrl );
//    exampleSocket.send(JSON.stringify(msg));
    exampleSocket.onopen = function (event) {
    exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
    };  

    exampleSocket.onerror = function (event) {
    // that.chatBotService.getAuthorization().timeout(120000).subscribe(result =>  { 
    //     console.log(result);
    //     that.chatConnectBody= result;
    //     },
    //      err => {
    //     }
    // );      
      console.log(event);      
    }

    exampleSocket.onmessage = function (event) {
     console.log(event.data);
     if(event.data && event.data.length>0)
     {
       let receiveMessage : ReceiveMessage = JSON.parse(event.data);
       if(receiveMessage.activities && receiveMessage.activities.length>0)
       {
         let response = receiveMessage.activities[0];//JSON.parse(that.testText);
         let watermark = receiveMessage.watermark;
         var gotIt = false;

         for(var i=0;i<that.messageArray.length;i++)
         {
           if(watermark==that.messageArray[i].watermark)
           {
             gotIt = true;
             break;
           }
         }

         if(gotIt==false)
         {
           if(response.from.id=='user1')
           {

           }
           else
           {             
               that.chatService.mockNewMsg(response.text);
           }
         }
       }
     }
    }
  }


    ionViewWillLeave() {
        // unsubscribe
        this.events.unsubscribe('chat:received');
    }

    ionViewDidEnter() {
        //get message list
        // this.getMsg()
        // .then(() => {
        //     this.scrollToBottom();
        // });

        // Subscribe to received  new message events
        this.events.subscribe('chat:received', msg => {
            this.pushNewMsg(msg);
        })
    }

    onFocus() {
        this.showEmojiPicker = false;
        this.content.resize();
        this.scrollToBottom();
    }

    switchEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
        if (!this.showEmojiPicker) {
            this.messageInput.setFocus();
        }
        this.content.resize();
        this.scrollToBottom();
    }

    /**
     * @name getMsg
     * @returns {Promise<ChatMessage[]>}
     */
    getMsg() {
        // Get mock message list
        return this.chatService
        .getMsgList()
        .then(res => {
            this.msgList = res;
        })
        .catch(err => {
            console.log(err)
        })
    }

    /**
     * @name sendMsg
     */
    sendMsg() {
        if (!this.editorMsg.trim()) return;

        // Mock message
        const id = Date.now().toString();
        let newMsg: ChatMessage = {
            messageId: Date.now().toString(),
            userId: this.user.id,
            userName: this.user.name,
            userAvatar: this.user.avatar,
            toUserId: this.toUser.id,
            time: Date.now(),
            message: this.editorMsg,
            status: 'pending'
        };

        this.pushNewMsg(newMsg);
        this.editorMsg = '';

        if (!this.showEmojiPicker) {
            this.messageInput.setFocus();
        }

        let sendRequest = new SendRequest();
        sendRequest.type = 'message';
        sendRequest.from = {'id': 'user1'};
        sendRequest.text = newMsg.message;


        this.chatService.sendMsg(sendRequest,this.chatConnectBody.conversationId).timeout(120000).subscribe(result =>  { 
            console.log(result);
            let index = this.getMsgIndexById(id);
            if (index !== -1) {
                this.receiveMessage();
              this.msgList[index].status = 'success';
            }

            },
             err => {
            }
          );       

        // this.chatService.sendMsg(sendRequest)
        // .then(() => {
        //     let index = this.getMsgIndexById(id);
        //     if (index !== -1) {
        //         this.msgList[index].status = 'success';
        //     }
        // })
    }

    /**
     * @name pushNewMsg
     * @param msg
     */
    pushNewMsg(msg: ChatMessage) {
        const userId = this.user.id,
              toUserId = this.toUser.id;
        // Verify user relationships
        if (msg.userId === userId && msg.toUserId === toUserId) {
            this.msgList.push(msg);
        } else if (msg.toUserId === userId && msg.userId === toUserId) {
            this.msgList.push(msg);
        }
        this.scrollToBottom();
    }

    getMsgIndexById(id: string) {
        return this.msgList.findIndex(e => e.messageId === id)
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.content.scrollToBottom) {
                this.content.scrollToBottom();
            }
        }, 400)
    }
}
