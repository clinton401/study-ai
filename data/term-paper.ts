import TermPaper, { ITermPaper } from "@/models/term-paper";


export const createNewTermPaper = (data: Omit<ITermPaper, "createdAt">) => {
    return TermPaper.create(data)
}

export const updateTermPaper = async (id: string, content: string) => {
    return TermPaper.findByIdAndUpdate(id, { content });
}

export const findTermPaperById = async (id: string) => {
    return TermPaper.findById(id);
}