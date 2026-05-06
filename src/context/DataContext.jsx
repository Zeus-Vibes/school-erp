import { createContext, useContext, useState, useCallback } from 'react'
import { students as initialStudents } from '../data/students'
import { teachers as initialTeachers } from '../data/teachers'

const STORAGE_KEYS = {
  students: 'erp_students_added',
  teachers: 'erp_teachers_added',
}

const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const additions = JSON.parse(stored)
    const existingIds = new Set(fallback.map((item) => item.id))
    const uniqueAdditions = additions.filter((item) => !existingIds.has(item.id))
    return [...fallback, ...uniqueAdditions]
  } catch {
    return fallback
  }
}

const saveAdditionsToStorage = (key, currentList, originalList) => {
  const originalIds = new Set(originalList.map((item) => item.id))
  const additions = currentList.filter((item) => !originalIds.has(item.id))
  localStorage.setItem(key, JSON.stringify(additions))
}

const DataContext = createContext(null)

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState(() =>
    loadFromStorage(STORAGE_KEYS.students, initialStudents)
  )
  const [teachers, setTeachers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.teachers, initialTeachers)
  )

  const addStudent = useCallback((studentData) => {
    const newId = `S${String(Date.now()).slice(-6)}`
    const classNum = parseInt(studentData.class)
    const stage = classNum >= 11
      ? 'Higher Secondary'
      : classNum >= 9
        ? 'Secondary'
        : 'Primary'

    const newStudent = {
      ...studentData,
      id: newId,
      roll: parseInt(studentData.roll) || 0,
      stage,
      admissionYear: new Date().getFullYear(),
      photoUrl: studentData.photoUrl || null,
    }

    setStudents((prev) => {
      const updated = [...prev, newStudent]
      saveAdditionsToStorage(STORAGE_KEYS.students, updated, initialStudents)
      return updated
    })

    return newStudent
  }, [])

  const deleteStudent = useCallback((studentId) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId)
      saveAdditionsToStorage(STORAGE_KEYS.students, updated, initialStudents)
      return updated
    })
  }, [])

  const addTeacher = useCallback((teacherData) => {
    const newId = `T${String(Date.now()).slice(-4)}`
    const newTeacher = {
      ...teacherData,
      id: newId,
      experience: parseInt(teacherData.experience) || 0,
      salary: parseInt(teacherData.salary) || 0,
      classes: typeof teacherData.classes === 'string'
        ? teacherData.classes.split(',').map((c) => c.trim()).filter(Boolean)
        : teacherData.classes || [],
      photoUrl: teacherData.photoUrl || null,
    }

    setTeachers((prev) => {
      const updated = [...prev, newTeacher]
      saveAdditionsToStorage(STORAGE_KEYS.teachers, updated, initialTeachers)
      return updated
    })

    return newTeacher
  }, [])

  const deleteTeacher = useCallback((teacherId) => {
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== teacherId)
      saveAdditionsToStorage(STORAGE_KEYS.teachers, updated, initialTeachers)
      return updated
    })
  }, [])

  const value = {
    students,
    teachers,
    addStudent,
    deleteStudent,
    addTeacher,
    deleteTeacher,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
