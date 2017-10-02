
export class ChatConnectBody
{
	conversationId : string;
	expires_in : number;
    referenceGrammarId : string;
	streamUrl : string;
    token : string;
}



export class SendRequest{
	type: string;
	from: {
		id: string
	};
	text: string;
}

export class ChatResponse{
   type : string;
   id : string;
   timestamp  : string;
   localTimestamp : string;
   channelId : string;
   from : {
        id : string;
        name : string;
   };
   conversation : {
        id : string;
   };
   text : string;
   inputHint : string;
   replyToId : string;
   attachments:any[];
}

export class ReceiveMessage {
  activities : ChatResponse[];
  watermark: string;  
}