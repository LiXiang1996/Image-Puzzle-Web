/**
 * 笔记状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NoteItem, NoteDetail } from '@/types/note'
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  publishNote,
  saveAsDraft,
  autoSaveNote,
} from '@/api/notes'
import type { CreateNoteRequest, UpdateNoteRequest } from '@/types/note'

export const useNotesStore = defineStore('notes', () => {
  // ==================== State ====================
  const notes = ref<NoteItem[]>([])
  const currentNote = ref<NoteDetail | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const searchKeyword = ref('')
  const currentFilter = ref<'all' | 'private' | 'public' | 'draft'>('all')

  // ==================== Getters ====================
  const filteredNotes = computed(() => {
    let result = notes.value

    // 按状态筛选
    if (currentFilter.value !== 'all') {
      result = result.filter((note) => note.status === currentFilter.value)
    }

    // 按关键词搜索（标题）
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter((note) => note.title.toLowerCase().includes(keyword))
    }

    return result
  })

  // ==================== Actions ====================

  /**
   * 获取笔记列表
   */
  const fetchNotes = async (params?: {
    page?: number
    page_size?: number
    search?: string
    status?: 'private' | 'public' | 'draft' | 'all'
  }) => {
    loading.value = true
    try {
      const response = await getNotes({
        page: params?.page || page.value,
        page_size: params?.page_size || pageSize.value,
        search: params?.search || searchKeyword.value || undefined,
        status: params?.status || (currentFilter.value === 'all' ? undefined : currentFilter.value),
      })

      if (response.data) {
        notes.value = response.data.list
        total.value = response.data.total
        page.value = response.data.page
        pageSize.value = response.data.page_size
      }

      return response
    } catch (error) {
      console.error('获取笔记列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取笔记详情
   */
  const fetchNoteById = async (noteId: string) => {
    loading.value = true
    try {
      const response = await getNoteById(noteId)
      if (response.data) {
        currentNote.value = response.data
      }
      return response
    } catch (error) {
      console.error('获取笔记详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建笔记
   */
  const addNote = async (data: CreateNoteRequest) => {
    loading.value = true
    try {
      const response = await createNote(data)
      if (response.data) {
        // 创建成功后，刷新列表
        await fetchNotes()
        currentNote.value = response.data
      }
      return response
    } catch (error) {
      console.error('创建笔记失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新笔记
   */
  const updateNoteById = async (noteId: string, data: UpdateNoteRequest) => {
    loading.value = true
    try {
      const response = await updateNote(noteId, data)
      if (response.data) {
        // 更新当前笔记
        if (currentNote.value?.id === noteId) {
          currentNote.value = response.data
        }
        // 更新列表中的笔记
        const index = notes.value.findIndex((n) => n.id === noteId)
        if (index !== -1) {
          notes.value[index] = {
            ...notes.value[index],
            ...response.data,
          }
        }
      }
      return response
    } catch (error) {
      console.error('更新笔记失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除笔记
   */
  const removeNote = async (noteId: string) => {
    loading.value = true
    try {
      await deleteNote(noteId)
      // 从列表中移除
      notes.value = notes.value.filter((n) => n.id !== noteId)
      // 如果删除的是当前笔记，清空当前笔记
      if (currentNote.value?.id === noteId) {
        currentNote.value = null
      }
    } catch (error) {
      console.error('删除笔记失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 发布笔记
   */
  const publishNoteById = async (noteId: string) => {
    loading.value = true
    try {
      const response = await publishNote(noteId)
      if (response.data) {
        // 更新列表中的笔记状态
        const index = notes.value.findIndex((n) => n.id === noteId)
        if (index !== -1) {
          notes.value[index].status = 'public'
        }
        // 更新当前笔记
        if (currentNote.value?.id === noteId) {
          currentNote.value.status = 'public'
          currentNote.value.published_at = response.data.published_at
        }
      }
      return response
    } catch (error) {
      console.error('发布笔记失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 存为草稿
   */
  const saveNoteAsDraft = async (noteId: string) => {
    loading.value = true
    try {
      const response = await saveAsDraft(noteId)
      if (response.data) {
        // 更新列表中的笔记状态
        const index = notes.value.findIndex((n) => n.id === noteId)
        if (index !== -1) {
          notes.value[index].status = 'draft'
        }
        // 更新当前笔记
        if (currentNote.value?.id === noteId) {
          currentNote.value.status = 'draft'
        }
      }
      return response
    } catch (error) {
      console.error('存为草稿失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 自动保存笔记
   */
  const autoSaveNoteById = async (noteId: string, content: string) => {
    try {
      await autoSaveNote(noteId, content)
      // 静默更新，不显示loading
      if (currentNote.value?.id === noteId) {
        currentNote.value.content = content
        currentNote.value.updated_at = new Date().toISOString()
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      throw error
    }
  }

  /**
   * 设置搜索关键词
   */
  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  /**
   * 设置筛选条件
   */
  const setFilter = (filter: 'all' | 'private' | 'public' | 'draft') => {
    currentFilter.value = filter
  }

  /**
   * 清空当前笔记
   */
  const clearCurrentNote = () => {
    currentNote.value = null
  }

  /**
   * 重置状态
   */
  const reset = () => {
    notes.value = []
    currentNote.value = null
    loading.value = false
    total.value = 0
    page.value = 1
    searchKeyword.value = ''
    currentFilter.value = 'all'
  }

  return {
    // State
    notes,
    currentNote,
    loading,
    total,
    page,
    pageSize,
    searchKeyword,
    currentFilter,
    // Getters
    filteredNotes,
    // Actions
    fetchNotes,
    fetchNoteById,
    addNote,
    updateNoteById,
    removeNote,
    publishNoteById,
    saveNoteAsDraft,
    autoSaveNoteById,
    setSearchKeyword,
    setFilter,
    clearCurrentNote,
    reset,
  }
})

