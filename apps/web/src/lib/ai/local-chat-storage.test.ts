import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLocalConversations,
  saveLocalConversations,
  upsertLocalConversation,
  getLocalMessages,
  addLocalMessage,
  deleteLocalConversation,
  mergeServerConversations,
  togglePinConversation,
  type LocalChatMessage,
  type LocalConversationItem,
} from './local-chat-storage';

describe('local-chat-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should save and retrieve local conversations', () => {
    const convs: LocalConversationItem[] = [
      {
        id: 'conv-1',
        title: 'Micro-SaaS Exploration',
        created_at: '2026-09-04T10:00:00Z',
        updated_at: '2026-09-04T10:00:00Z',
      },
    ];

    saveLocalConversations(convs);
    const retrieved = getLocalConversations();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].title).toBe('Micro-SaaS Exploration');
  });

  it('should upsert local conversation and order by updated_at', () => {
    const conv1: LocalConversationItem = {
      id: 'conv-1',
      title: 'First Chat',
      created_at: '2026-09-04T10:00:00Z',
      updated_at: '2026-09-04T10:00:00Z',
    };

    const conv2: LocalConversationItem = {
      id: 'conv-2',
      title: 'Second Chat (Newer)',
      created_at: '2026-09-04T11:00:00Z',
      updated_at: '2026-09-04T11:00:00Z',
    };

    upsertLocalConversation(conv1);
    upsertLocalConversation(conv2);

    const convs = getLocalConversations();
    expect(convs).toHaveLength(2);
    expect(convs[0].id).toBe('conv-2'); // Newer should be first
  });

  it('should save and add local messages for a conversation', () => {
    const msg1: LocalChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello IdeaForge',
    };

    addLocalMessage('conv-1', msg1);

    const msgs = getLocalMessages('conv-1');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toBe('Hello IdeaForge');

    const msg2: LocalChatMessage = {
      id: 'msg-2',
      role: 'assistant',
      content: 'Here is an idea...',
    };

    addLocalMessage('conv-1', msg2);
    expect(getLocalMessages('conv-1')).toHaveLength(2);
  });

  it('should delete local conversation and its messages', () => {
    upsertLocalConversation({
      id: 'conv-to-delete',
      title: 'Temporary',
      created_at: '2026-09-04T10:00:00Z',
      updated_at: '2026-09-04T10:00:00Z',
    });
    addLocalMessage('conv-to-delete', { id: 'm1', role: 'user', content: 'test' });

    deleteLocalConversation('conv-to-delete');

    expect(getLocalConversations()).toHaveLength(0);
    expect(getLocalMessages('conv-to-delete')).toHaveLength(0);
  });

  it('should pin conversations to the top', () => {
    upsertLocalConversation({
      id: 'conv-older',
      title: 'Older Chat',
      created_at: '2026-09-04T08:00:00Z',
      updated_at: '2026-09-04T08:00:00Z',
    });
    upsertLocalConversation({
      id: 'conv-newer',
      title: 'Newer Chat',
      created_at: '2026-09-04T10:00:00Z',
      updated_at: '2026-09-04T10:00:00Z',
    });

    // Pin older chat
    const result = togglePinConversation('conv-older');
    expect(result.pinned).toBe(true);

    const convs = getLocalConversations();
    expect(convs[0].id).toBe('conv-older'); // Pinned comes first!
    expect(convs[0].isPinned).toBe(true);
  });

  it('should seamlessly merge server conversations with local cache', () => {
    saveLocalConversations([
      {
        id: 'local-only',
        title: 'Draft in progress',
        created_at: '2026-09-04T12:00:00Z',
        updated_at: '2026-09-04T12:00:00Z',
      },
    ]);

    const serverConvs = [
      {
        id: 'server-1',
        title: 'Server Conversation',
        created_at: '2026-09-04T11:00:00Z',
        updated_at: '2026-09-04T11:00:00Z',
      },
    ];

    const merged = mergeServerConversations(serverConvs);
    expect(merged).toHaveLength(2);
    expect(merged.some((c) => c.id === 'local-only')).toBe(true);
    expect(merged.some((c) => c.id === 'server-1')).toBe(true);
  });
});
