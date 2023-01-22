const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { suggesModel } = require('./suggesModel');
const { trimText } = require('../../utils/trimText');

cohere.init(process.env.COHERE);

const suggestCommand = {
	...new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest What to Say Next!')
		.addStringOption(option =>
			option.setName('input').setDescription('The input text you want me to respond to.').setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const input = interaction.options.getString('input');
		const response = await cohere
			.generate({
				model: 'command-xlarge-nightly',
				prompt: suggesModel(input),
				max_tokens: 650,
				temperature: 0.4,
				k: 0,
				p: 0.75,
				frequency_penalty: 0,
				presence_penalty: 0,
				stop_sequences: [],
				return_likelihoods: 'NONE',
			})
			.catch(async () => {
				await interaction.editReply({
					content: 'Error with COHERE',
				});
			});

		const text = trimText(trimText(response), 'Human:');
		if (text == '-' || text.length <= 5) {
			await interaction.editReply({
				content: 'Error With Suggest Please ReSubmit',
			});
		} else {
			await interaction.editReply({
				content: `${input} ${text}`,
			});
		}
	},
};
exports.suggestCommand = suggestCommand;