import prisma from '../config/db.js'

export const createEleve = async (data: {
  nom: string
  prenom: string
  classeId: number
}) => {
  return prisma.eleve.create({
    data
  })
}

export const getAllEleves = async () => {
  return prisma.eleve.findMany({
    include: {
      classe: true
    }
  })
}
