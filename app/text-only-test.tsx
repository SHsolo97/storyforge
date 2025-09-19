import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import chapter1Data from '@/data/chapter1.json';

// Interfaces matching the actual chapter data structure
interface Effect {
  op: string;
  args: Record<string, any>;
}

interface Choice {
  id: string;
  text: string;
  effects: Effect[];
  cost?: number;
  costType?: 'diamonds' | 'tickets';
}

interface StoryNode {
  effects?: Effect[];
  choices?: Choice[];
}

interface ChapterData {
  startNode: string;
  nodes: Record<string, StoryNode>;
}

export default function TextOnlyTest() {
  const [currentNodeId, setCurrentNodeId] = useState(chapter1Data.startNodeId);
  const [gameState, setGameState] = useState({
    variables: {
      Confidence: 0,
      Empathy: 0,
      Creativity: 0,
      diamonds: 100,
      tickets: 5
    }
  });
  
  // State to track displayed content
  const [displayedContent, setDisplayedContent] = useState<Array<{
    type: 'narration' | 'dialogue' | 'choice_result';
    content: string;
    speaker?: string;
  }>>([]);
  
  const [availableChoices, setAvailableChoices] = useState<Choice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentNode = (chapter1Data.nodes as any)[currentNodeId];

  // Process effects and update game state
  const processEffects = (effects: Effect[]) => {
    const newContent = [...displayedContent];
    let newGameState = { ...gameState };
    let nextNodeId = currentNodeId;
    
    effects.forEach(effect => {
      switch (effect.op) {
        case 'narration':
          newContent.push({
            type: 'narration',
            content: effect.args.text
          });
          break;
          
        case 'dialogue':
          newContent.push({
            type: 'dialogue',
            content: effect.args.text,
            speaker: effect.args.speaker
          });
          break;
          
        case 'inc':
          const incVar = effect.args.var as keyof typeof gameState.variables;
          if (newGameState.variables[incVar] !== undefined) {
            (newGameState.variables[incVar] as number) += effect.args.value;
          }
          newContent.push({
            type: 'choice_result',
            content: `+${effect.args.value} ${effect.args.var}`
          });
          break;
          
        case 'dec':
          const decVar = effect.args.var as keyof typeof gameState.variables;
          if (newGameState.variables[decVar] !== undefined) {
            (newGameState.variables[decVar] as number) -= effect.args.value;
          }
          newContent.push({
            type: 'choice_result',
            content: `-${effect.args.value} ${effect.args.var}`
          });
          break;
          
        case 'goto':
          nextNodeId = effect.args.target;
          break;
          
        case 'end':
          newContent.push({
            type: 'narration',
            content: effect.args.text || 'Chapter Complete!'
          });
          break;
          
        // Skip asset-related effects for text-only mode
        case 'bg':
        case 'music':
        case 'sfx':
        case 'char':
        case 'cg':
          // Ignore these for text-only test
          break;
      }
    });
    
    setDisplayedContent(newContent);
    setGameState(newGameState);
    
    if (nextNodeId !== currentNodeId) {
      setCurrentNodeId(nextNodeId);
    }
  };

  // Load current node effects when node changes
  useEffect(() => {
    if (currentNode && currentNode.onEnter) {
      setIsProcessing(true);
      setTimeout(() => {
        processEffects(currentNode.onEnter);
        setAvailableChoices(currentNode.choices || []);
        setIsProcessing(false);
      }, 500);
    } else {
      setAvailableChoices(currentNode?.choices || []);
    }
  }, [currentNodeId]);

  const handleChoiceSelect = (choice: Choice) => {
    setIsProcessing(true);
    setAvailableChoices([]);
    
    // Add choice selection to content
    const newContent: Array<{
      type: 'narration' | 'dialogue' | 'choice_result';
      content: string;
      speaker?: string;
    }> = [...displayedContent, {
      type: 'choice_result',
      content: `You chose: ${choice.text}`
    }];
    setDisplayedContent(newContent);
    
    // Process choice effects
    setTimeout(() => {
      processEffects(choice.effects);
      setIsProcessing(false);
    }, 800);
  };

  const handleRestart = () => {
    setCurrentNodeId(chapter1Data.startNodeId);
    setDisplayedContent([]);
    setAvailableChoices([]);
    setGameState({
      variables: {
        Confidence: 0,
        Empathy: 0,
        Creativity: 0,
        diamonds: 100,
        tickets: 5
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const canAffordChoice = (choice: Choice) => {
    if (!choice.cost) return true;
    const costType = choice.costType || 'diamonds';
    return gameState.variables[costType as keyof typeof gameState.variables] >= choice.cost;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chapter 1 - Text Only</Text>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartButtonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      {/* Game State Display */}
      <View style={styles.gameStateContainer}>
        <Text style={styles.gameStateText}>
          Confidence: {gameState.variables.Confidence} | 
          Empathy: {gameState.variables.Empathy} | 
          Creativity: {gameState.variables.Creativity} | 
          💎 {gameState.variables.diamonds} | 
          🎫 {gameState.variables.tickets}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Display accumulated content */}
        {displayedContent.map((item, index) => (
          <View key={index} style={[
            styles.contentItem,
            item.type === 'narration' && styles.narrationContainer,
            item.type === 'dialogue' && styles.dialogueContainer,
            item.type === 'choice_result' && styles.choiceResultContainer
          ]}>
            {item.type === 'dialogue' && (
              <Text style={styles.speakerText}>{item.speaker}:</Text>
            )}
            <Text style={[
              item.type === 'narration' && styles.narrationText,
              item.type === 'dialogue' && styles.dialogueText,
              item.type === 'choice_result' && styles.choiceResultText
            ]}>
              {item.content}
            </Text>
          </View>
        ))}

        {/* Processing indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>...</Text>
          </View>
        )}

        {/* Choices */}
        {!isProcessing && availableChoices.length > 0 && (
          <View style={styles.choicesContainer}>
            <Text style={styles.choicesHeader}>Choose your action:</Text>
            {availableChoices.map((choice, index) => {
              const affordable = canAffordChoice(choice);
              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceButton,
                    { backgroundColor: affordable ? `hsl(${200 + index * 30}, 70%, 50%)` : '#666' }
                  ]}
                  onPress={() => affordable && handleChoiceSelect(choice)}
                  disabled={!affordable}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.choiceText, !affordable && styles.disabledChoiceText]}>
                    {choice.text}
                  </Text>
                  {choice.cost && (
                    <Text style={styles.costText}>
                      {choice.costType === 'tickets' ? '🎫' : '💎'} {choice.cost}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Current Node: {currentNodeId} | Content Items: {displayedContent.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '600',
  },
  restartButton: {
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  gameStateContainer: {
    backgroundColor: '#0f1419',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  gameStateText: {
    color: '#4fc3f7',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  contentItem: {
    marginBottom: 16,
  },
  narrationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4fc3f7',
  },
  narrationText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  dialogueContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  speakerText: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dialogueText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
  },
  choiceResultContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  choiceResultText: {
    color: '#ffc107',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  processingText: {
    color: '#888',
    fontSize: 24,
    fontWeight: 'bold',
  },
  choicesContainer: {
    marginTop: 20,
  },
  choicesHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  choiceButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  choiceText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  disabledChoiceText: {
    color: '#aaa',
  },
  costText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  debugText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});