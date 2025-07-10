import dayjslib from 'dayjs'
import ptBR from 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjslib.extend(relativeTime).locale(ptBR)

export const dayjs = dayjslib
