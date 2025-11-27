<template>
  <div class="note-editor-container">
    <div class="editor-wrapper">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <el-button
            :type="editor?.isActive('bold') ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleBold().run()"
            size="small"
          >
            <strong>B</strong>
          </el-button>
          <el-button
            :type="editor?.isActive('italic') ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleItalic().run()"
            size="small"
          >
            <em>I</em>
          </el-button>
        </div>
        <div class="toolbar-group">
          <el-button
            :type="editor?.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
            size="small"
          >
            H1
          </el-button>
          <el-button
            :type="editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
            size="small"
          >
            H2
          </el-button>
          <el-button
            :type="editor?.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
            size="small"
          >
            H3
          </el-button>
        </div>
        <div class="toolbar-group">
          <el-button
            :icon="Picture"
            @click="handleInsertImage"
            size="small"
            circle
          />
          <el-button
            @click="handleInsertLink"
            size="small"
          >
            链接
          </el-button>
          <el-button
            :type="editor?.isActive('codeBlock') ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleCodeBlock().run()"
            size="small"
          >
            代码
          </el-button>
        </div>
        <div class="toolbar-group">
          <el-button
            :type="editor?.isActive('blockquote') ? 'primary' : 'default'"
            @click="editor?.chain().focus().toggleBlockquote().run()"
            size="small"
            :icon="ChatLineRound"
          />
          <el-button
            @click="editor?.chain().focus().setHorizontalRule().run()"
            size="small"
          >
            分割线
          </el-button>
        </div>
      </div>

      <!-- 标题输入框 -->
      <el-input
        v-model="noteTitle"
        placeholder="请输入笔记标题..."
        class="title-input"
        @input="handleTitleChange"
      />

      <!-- 富文本编辑区 -->
      <div class="editor-content">
        <EditorContent :editor="editor" />
      </div>

      <!-- 底部操作栏 -->
      <div class="editor-footer">
        <div class="status-info">
          <el-tag
            :type="getStatusTagType(currentStatus)"
            size="small"
          >
            {{ getStatusText(currentStatus) }}
          </el-tag>
          <span class="save-status">{{ saveStatus }}</span>
        </div>
        <div class="action-buttons">
          <el-button
            @click="handleSaveAsDraft"
            :loading="saving"
          >
            存为草稿
          </el-button>
          <el-button
            type="primary"
            @click="handlePublish"
            :loading="saving"
          >
            发布
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useNotesStore } from '@/stores/notes'
import { uploadAvatar } from '@/api/auth'
import { ElMessage, ElInput } from 'element-plus'
import {
  Picture,
  ChatLineRound,
} from '@element-plus/icons-vue'
import { debounce } from '@/utils/index'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

// 笔记ID（新建时为空）
const noteId = ref<string | null>(route.params.id as string || null)
const noteTitle = ref('')
const currentStatus = ref<'private' | 'public' | 'draft'>('private')
const saving = ref(false)
const saveStatus = ref('已保存')

// Tiptap编辑器实例
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: false,
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  content: '',
  onUpdate: () => {
    // 内容更新时触发自动保存
    handleAutoSave()
  },
})

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'private':
      return 'info'
    case 'public':
      return 'success'
    case 'draft':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'private':
      return '私密'
    case 'public':
      return '已发布'
    case 'draft':
      return '草稿'
    default:
      return '未知'
  }
}

/**
 * 标题变化处理
 */
const handleTitleChange = () => {
  // 标题变化时也可以触发保存
  handleAutoSave()
}

/**
 * 自动保存（30秒防抖）
 */
const handleAutoSave = debounce(async () => {
  if (!noteId.value || !noteTitle.value.trim()) {
    return
  }

  saveStatus.value = '保存中...'
  try {
    const content = editor.value?.getHTML() || ''
    await notesStore.autoSaveNoteById(noteId.value, content)
    saveStatus.value = '已保存'
  } catch (error) {
    console.error('自动保存失败:', error)
    saveStatus.value = '保存失败'
  }
}, 30000) // 30秒

/**
 * 插入图片
 */
const handleInsertImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }

    try {
      // 上传图片
      const response = await uploadAvatar(file)
      const imageUrl = response?.avatar || response?.url

      if (imageUrl && editor.value) {
        // 插入图片到编辑器
        editor.value.chain().focus().setImage({ src: imageUrl }).run()
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      ElMessage.error('上传图片失败')
    }
  }
  input.click()
}

/**
 * 插入链接
 */
const handleInsertLink = () => {
  const url = window.prompt('请输入链接地址:')
  if (url && editor.value) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

/**
 * 存为草稿
 */
const handleSaveAsDraft = async () => {
  if (!noteTitle.value.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  saving.value = true
  try {
    const content = editor.value?.getHTML() || ''

    if (noteId.value) {
      // 更新现有笔记
      await notesStore.updateNoteById(noteId.value, {
        title: noteTitle.value,
        content,
        status: 'draft',
      })
      await notesStore.saveNoteAsDraft(noteId.value)
    } else {
      // 创建新笔记
      await notesStore.addNote({
        title: noteTitle.value,
        content,
        status: 'draft',
      })
      // addNote 会自动更新 currentNote，从那里获取 id
      if (notesStore.currentNote) {
        noteId.value = notesStore.currentNote.id
        router.replace(`/edit/${noteId.value}`)
      }
    }

    currentStatus.value = 'draft'
    ElMessage.success('已存为草稿')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 发布笔记
 */
const handlePublish = async () => {
  if (!noteTitle.value.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  saving.value = true
  try {
    const content = editor.value?.getHTML() || ''

    if (noteId.value) {
      // 更新现有笔记并发布
      await notesStore.updateNoteById(noteId.value, {
        title: noteTitle.value,
        content,
        status: 'public',
      })
      await notesStore.publishNoteById(noteId.value)
    } else {
      // 创建新笔记并发布
      await notesStore.addNote({
        title: noteTitle.value,
        content,
        status: 'public',
      })
      // addNote 会自动更新 currentNote，从那里获取 id
      if (notesStore.currentNote) {
        noteId.value = notesStore.currentNote.id
        if (noteId.value) {
          await notesStore.publishNoteById(noteId.value)
          router.replace(`/edit/${noteId.value}`)
        }
      }
    }

    currentStatus.value = 'public'
    ElMessage.success('发布成功！')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 加载笔记数据
 */
const loadNote = async () => {
  if (!noteId.value) {
    // 新建笔记，初始化默认值
    noteTitle.value = ''
    editor.value?.commands.setContent('')
    currentStatus.value = 'private'
    return
  }

  try {
    await notesStore.fetchNoteById(noteId.value)
    const note = notesStore.currentNote

    if (note) {
      noteTitle.value = note.title
      editor.value?.commands.setContent(note.content || '')
      currentStatus.value = note.status
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
    ElMessage.error('加载笔记失败')
    router.push('/home')
  }
}

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    noteId.value = (newId as string) || null
    loadNote()
  },
  { immediate: true }
)

// 组件卸载时清理
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.note-editor-container {
  width: 100%;
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
  padding: var(--spacing-lg);
}

.editor-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: var(--spacing-lg);
}

.toolbar {
  display: flex;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.title-input {
  margin-bottom: var(--spacing-md);
}

:deep(.title-input .el-input__wrapper) {
  font-size: var(--font-size-h3);
  font-weight: 600;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.editor-content {
  min-height: 400px;
  margin-bottom: var(--spacing-lg);
}

:deep(.ProseMirror) {
  outline: none;
  min-height: 400px;
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

:deep(.ProseMirror h1) {
  font-size: var(--font-size-h1);
  font-weight: 600;
  margin: var(--spacing-lg) 0 var(--spacing-md);
  color: var(--text-primary);
}

:deep(.ProseMirror h2) {
  font-size: var(--font-size-h2);
  font-weight: 600;
  margin: var(--spacing-md) 0;
  color: var(--text-primary);
}

:deep(.ProseMirror h3) {
  font-size: var(--font-size-h3);
  font-weight: 600;
  margin: var(--spacing-md) 0;
  color: var(--text-primary);
}

:deep(.ProseMirror p) {
  margin: var(--spacing-sm) 0;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: var(--spacing-md) 0;
}

:deep(.ProseMirror a) {
  color: var(--link-color);
  text-decoration: underline;
}

:deep(.ProseMirror code) {
  background-color: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: var(--font-family-code);
  font-size: 0.9em;
}

:deep(.ProseMirror pre) {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--spacing-md) 0;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--text-secondary);
  font-style: italic;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.status-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.save-status {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}
</style>

