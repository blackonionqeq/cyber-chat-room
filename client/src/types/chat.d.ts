
export enum ChatContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  OTHER = 'OTHER',
}

export type ChatContentItem = {
	id:      String
	roomId:  String
	userId:  String
	content: String
	type:    ChatContentType
	// createTime: string
	updateTime: string
}