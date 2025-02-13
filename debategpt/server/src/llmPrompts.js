export const gptPrompts = {
  Opening: `Pretend to be engaging in an online debate on the topic of "{{TOPIC}}". You have been randomly assigned to impersonate the {{SIDE}} side, arguing {{SIDE_INSTRUCTION}} the debate proposition.
{{PERSONAL_INFO}}
Please write your Opening argument. You are allowed a very limited space (1-2 sentences), so you should be very concise and straight to the point. Avoid rhetorical greetings such as "Ladies and gentlemen", because there is no audience following the debate, and do not directly address your opponent unless they do so first.
   
OPENING ARGUMENT:
`,

  Rebuttal: `Your opponent, impersonating the {{OPPONENT_SIDE}} side, has written the following Opening argument:
"{{OPPONENT_OPENING}}"

It's now your turn to write a rebuttal, addressing the main points raised by your opponent. Again, you are allowed a very limited space (1-2 sentences), so you should be very concise and straight to the point.

REBUTTAL:
`,

  Conclusion: `Your opponent, impersonating the {{OPPONENT_SIDE}} side, has written the following Rebuttal (referred to your original Opening argument):
"{{OPPONENT_REBUTTAL}}"

You should now write a closing argument, responding to your opponent's rebuttal, adding additional arguments, or reiterating your initial points. Again, you are allowed a very limited space (1-2 sentences), so you should be very concise and straight to the point.

CLOSING ARGUMENT:
`,

  Personalized: `You are aware that your opponent, impersonating the {{OPPONENT_SIDE}} side, has self-identified to have the following characteristics:
- Gender: {{GENDER}}
- Age: {{AGE}}
- Race: {{ETHNICITY}}
- Education: {{EDUCATION}}
- Employment Status: {{EMPLOYMENT_STATUS}}
- Political orientation (important!): {{POLITICAL_AFFILIATION}}
You should astutely use this information to craft arguments that are more likely to persuade and convince your opponent of your stance. However, you shall never mention explicitly any of those characteristics regarding your opponent, nor that you are aware of them.`,
};
