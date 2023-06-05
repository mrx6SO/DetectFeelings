import React, { useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ListItem, Button, Input } from '@rneui/base';
import { useMemo } from 'react';

// Defina sua chave de API do OpenAI

const apiKey = '';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      const newMessage = {
        text: inputValue,
        sentiment: await analyzeSentiment(inputValue),
      };
      setMessages([...messages, newMessage]);

  
        setInputValue('');
     
      }
    
    };

  /* @ adaptação da props `handleLongPress`
  *  @ short_description: atualiza as mensagens renderizadas no componente `ListItem`
  *  
  *   @long_description::description:
  * 
  *   Ao pressionar por um período longo (~ 2 seg) sob o elemento contendo a resposta da api,
  *   `ScrollView` é atualizado, com base no `index` do array `messages`
  * */ 
  const handleLongPress = (index) => {
    const updatedMessages = [...messages];
    updatedMessages.splice(index, 1);
    setMessages(updatedMessages);
  }
// função para analisar a polaridade da mensagem
const analyzeSentiment = async (text) => {
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: `Analyze the sentiment as 'positive', 'negative' or 'neutral' of the following text: ${text}'`,
        max_tokens: 1,
        model: "text-davinci-003", 
        temperature: 0,
      }),
    });

    const data = await response.json();
    const res = [];
    console.debug(data.error);
    
    res.push({
      resultados: data
    });
    
    localStorage.setItem("resultados", JSON.stringify(res)); 
    
    if(data.error) { 
      
      return JSON.parse(localStorage.resultados)[0].resultados.error.code//null;

    }
    
    if (data) {

      return JSON.parse(localStorage.resultados)[0].resultados.choices[0].text;
  
    }

    if (data || data.choices.length > 1) {
    
     //&& data.choices.length > 0) {
  //      return data.choices[0].text;
    //const sentimentAnalyzed = data.choices[0].text;

     const sentiment = data.choices[0].text;//.toLowerCase();
      /*let sentiment = 'positivo' || 'negativo' || 'neutro';*/
      if (sentiment === 'positive') {
        return 'Positivo';
      } else if (sentiment === 'negative') {
        return 'Negativo';
      } else if (sentiment === 'neutral') {
        return 'Neutro';
      }
    } else { //if (!sentiment) {
      //console.error('Resposta inválida recebida da OpenAI API. Verifique sua apiKey.');
      
      return data.error.message; //'Resposta inválida recebida da OpenAI API. Verifique sua apiKey';
    }
  } catch (error) {
      console.error(error);
    //return new Array[{"code": "invalid_api_key"}]
    return JSON.parse(localStorage.resultados)[0].resultados.error.code
    //return `code: "invalid_api_key"`
  }
};


return (
  <>
  <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <ScrollView>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              bottomDivider
              onLongPress={() => handleLongPress(index)}
            >
              <ListItem.Content>
                <ListItem.Title>{`Frase: ${message.text}`}</ListItem.Title>
                <ListItem.Subtitle>{`Sentimento: ${message.sentiment}`}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          ))}
        </ScrollView>
        <View style={{ padding: 5 }}>
          <Input style={{ textAlign: 'center' }}
            placeholder="Digite uma frase"
            value={inputValue}
            onChangeText={(text) => setInputValue(text)}
          />
          <Button title="Enviar" onPress={handleSendMessage} />
          {messages.map((message, index) => (
            <View key={index} bottomDivider  onLongPress={() => handleLongPress(index)}>
              <Text>{`Frase: ${message.text}`}</Text>
              <Text>{`Sentimento: ${message.sentiment}`}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaProvider>
    </>
  );
};

export default App;