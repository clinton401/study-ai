import TermPaper, {ITermPaper} from "@/models/term-paper";


export const createNewTermPaper = (data: Omit<ITermPaper, "createdAt">) => {
    return TermPaper.create(data)
}