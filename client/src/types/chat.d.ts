
export enum ChatContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  OTHER = 'OTHER',
}

export type ChatContentItem = {
	id:      string
	roomId:  string
	userId:  string
	content: string
	type:    ChatContentType
	// createTime: string
	updateTime: string
}