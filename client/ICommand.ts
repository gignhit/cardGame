import { CommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";

export abstract class ICommand{
    static CommandName :string;
    static subCommand :SlashCommandSubcommandBuilder;

    abstract execute(interaction:CommandInteraction) :void
}