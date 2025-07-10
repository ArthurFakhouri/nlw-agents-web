import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateRoomQuestionRequest } from './types/create-room-question-request'
import type { CreateRoomQuestionResponse } from './types/create-room-question-response'
import type { GetRoomQuestionsReponse } from './types/get-room-questions-response'

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoomQuestionRequest) => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      return (await response.json()) as CreateRoomQuestionResponse
    },
    onMutate({ question }) {
      const questions = queryClient.getQueryData<GetRoomQuestionsReponse[]>([
        'get-room-questions',
        roomId,
      ])

      const questionArray = questions ? questions : []

      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true,
      }

      queryClient.setQueryData<GetRoomQuestionsReponse[]>([
        'geet-room-questions',
        roomId,
      ], [
        newQuestion,
        ...questionArray,
      ])

      return { newQuestion, questions }
    },
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<GetRoomQuestionsReponse[]>([
        'geet-room-questions',
        roomId,
      ], questions => {

        if (!questions) {
          return questions
        }

        if (!context.newQuestion) {
          return questions
        }

        return questions.map(question => {
          if (question.id === context.newQuestion.id) {
            return {
              ...context.newQuestion,
              id: data.questionId,
              answer: data.answer,
              isGeneratingAnswer: false,
            }
          }

          return question
        })
      })
    },
    onError: (_error, _variables, context) => {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomQuestionsReponse[]>([
          'geet-room-questions',
          roomId,
        ], context.questions)
      }
    }
  })
}
