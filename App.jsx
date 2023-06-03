import React, { useState } from 'react';
import { Text, View, ScrollView } from 'react-native';
//import { Input, Button, ListItem } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { Input } from '@rneui/base';
//import { Button } from '@rneui/themed';
import { ListItem, Button, Input } from '@rneui/base';
// Defina sua chave de API do OpenAI
//const apiKey = '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'
const apiKey = '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';

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
    

  // adaptação da props `handleLongPress` para atualizar as mensagens
  // renderizadas no componente ListItem
  // ao pressionar sobre elemento contendo a resposta retornada da api
  // ela é removida da `ScrollView` 
  const handleLongPress = (index) => {
    const updatedMessages = [...messages];
    updatedMessages.splice(index, 1);
    setMessages(updatedMessages);
  }

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
      }),
    });

    const data = await response.json();
    const res = [];
    console.debug(data.error);
    
    res.push(data)
    localStorage.setItem("resultados", JSON.stringify(res)); 
    
    if(!data) { 
      return "neutral"

      }
    
    if (data && data.choices && data.choices.length > 0) {
      const sentiment = data.choices[0].text.trim();//.toLowerCase();
      /*let sentiment = 'positivo' || 'negativo' || 'neutro';*/
      if (sentiment == 'positive') {
        return 'Positivo';
      } else if (sentiment == 'negative') {
        return 'Negativo';
      } else if (sentiment == undefined) {
        return 'Neutro';
      }
    } else { //if (!sentiment) {
      //console.error('Resposta inválida recebida da OpenAI API. Verifique sua apiKey.');
      
      return error.message; //'Resposta inválida recebida da OpenAI API. Verifique sua apiKey';
    }
  } catch (error) {
      console.error(error);
    //return new Array[{"code": "invalid_api_key"}]
    return `code: "invalid_api_key"`
  }
};


return (
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
  );
};

export default App;