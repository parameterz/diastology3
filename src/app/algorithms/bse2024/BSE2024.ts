// src/algorithms/BSE.ts - BSE Algorithm
import {
  Algorithm,
  DecisionNode,
  ResultNode,
  ResultKey,
  DecisionOption,
  NextNodesMap
} from "../../../types/algorithm";


// Helper function for creating standard decision nodes
function createDecisionNode(
  id: string,
  question: string,
  options: DecisionOption[],
  nextNodes: NextNodesMap
): DecisionNode {
  return {
    id,
    type: "decision",
    question,
    options,
    nextNodes,
  };
}
// Helper function for creating result nodes
function createResultNode(id: string, resultKey: ResultKey): ResultNode {
  return {
    id,
    type: 'result',
    resultKey
  };
}

// Define the BSE algorithm
const bse2024Algorithm: Algorithm = {
  id: 'bse2024',
  name: 'BSE Diastolic Function (2024)',
  description: 'Recently updated and published by the British Society of Echo',
  citation: {
    authors: "Robinson, S., Ring, L., Oxborough, D. et al.",
    title: "The assessment of left ventricular diastolic function: guidance and recommendations from the British Society of Echocardiography",
    journal: "Echo Res Pract 11, 16 (2024)",
    url: "https://pubmed.ncbi.nlm.nih.gov/38825710/",
  },
  modes: [
    { 
      id: 'standard', 
      name: 'BSE Standard Algorithm', 
      description: 'Use this for normal LV function',
      startNodeId: 'standardStart' 
    },
    { 
      id: 'dysfunction', 
      name: 'BSE Dysfunction Algorithm', 
      description: 'Use this for decreased EF & myocardial disease',
      startNodeId: 'dysfunctionStart' 
    },
    { 
      id: 'afib', 
      name: 'BSE Atrial Fibrillation Algorithm', 
      description: 'Specifically for use in patients in atrial fibrillation',
      startNodeId: 'afibStart' 
    }
  ],
  startNodeId: 'standardStart',
  nodes: {
    // Standard algorithm nodes
    'standardStart': createDecisionNode(
      'standardStart',
      'What is the TR Velocity?',
      [
        {value: 'positive', text: '> 2.8 m/s'},
        {value: 'negative', text: '≤ 2.8 m/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'laVolume' // Go to next question regardless of answer
      }
    ),
    
    'laVolume': createDecisionNode(
      'laVolume',
      'What is the indexed LA Volume?',
      [
        {value: 'positive', text: '> 34 ml/m²'},
        {value: 'negative', text: '≤ 34 ml/m²'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'eToERatio' // Go to next question regardless of answer
      }
    ),
    
    'eToERatio': createDecisionNode(
      'eToERatio',
      'What is the E/e\' ratio?',
      [
        {value: 'positive', text: '> 14'},
        {value: 'negative', text: '≤ 14'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'standardEvaluate' // Go to evaluation node
      }
    ),
    
    'standardEvaluate': {
      id: 'standardEvaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        const positives = Object.values(answers).filter(a => a === 'positive').length;
        const negatives = Object.values(answers).filter(a => a === 'negative').length;
        const unavailables = Object.values(answers).filter(a => a === 'unavailable').length;
        const availables = Object.keys(answers).length - unavailables;
        
        if (unavailables >= 2) {
          return 'resultInsufficientInfo';
        }
        
        if (negatives >= 2) {
          return 'ageSpecificE';
        } else if (positives >= 2) {
          return 'resultImpairedElevated';
        } else if (availables === 2 && positives === 1 && negatives === 1) {
          return 'laStrain';
        } else {
          return 'resultIndeterminate';
        }
      }
    },
    
    'ageSpecificE': createDecisionNode(
      'ageSpecificE',
      'What is the SEPTAL e\'?',
      [
        {value: 'positive', text: '18-40 yrs male: < 7 cm/sec'},
        {value: 'positive', text: '18-40 yrs female: < 8 cm/sec'},
        {value: 'positive', text: '41-65 yrs: < 5 cm/sec'},
        {value: 'positive', text: '>65 yrs: < 4 cm/sec'},
        {value: 'negative', text: 'Septal e\' is greater than these'}
      ],
      {
        '*': 'lateralE'
      }
    ),
    
    'lateralE': createDecisionNode(
      'lateralE',
      'What is the LATERAL e\'?',
      [
        {value: 'positive', text: '18-40 yrs male: < 9 cm/sec'},
        {value: 'positive', text: '18-40 yrs female: < 11 cm/sec'},
        {value: 'positive', text: '41-65 yrs: < 6 cm/sec'},
        {value: 'positive', text: '>65 yrs: < 5 cm/sec'},
        {value: 'negative', text: 'Lateral e\' is greater than these'}
      ],
      {
        '*': 'ageSpecificEEvaluate'
      }
    ),
    
    'ageSpecificEEvaluate': {
      id: 'ageSpecificEEvaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        // Only consider the answers for the age-specific e' nodes
        const ageSpecificAnswers = {
          ageSpecificE: answers['ageSpecificE'],
          lateralE: answers['lateralE']
        };
        
        const positives = Object.values(ageSpecificAnswers).filter(a => a === 'positive').length;
        
        if (positives > 0) {
          return 'resultImpairedNormal';
        } else {
          return 'resultNormal';
        }
      }
    },
    
    'laStrain': createDecisionNode(
      'laStrain',
      'What is the LA Strain?',
      [
        {value: 'negative', text: 'pump strain ≥ 14% OR reservoir strain ≥ 30%'},
        {value: 'positive', text: 'pump strain < 14% OR reservoir strain < 30%'}
      ],
      {
        'positive': 'lars',
        'negative': 'ageSpecificE'
      }
    ),
    
    'lars': createDecisionNode(
      'lars',
      'More specifically, What is the LA reservoir strain (LARS)?',
      [
        {value: 'negative', text: 'LARS ≥ 18%'},
        {value: 'positive', text: 'LARS < 18%'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'supplementalParams'
      }
    ),
    
    'supplementalParams': createDecisionNode(
      'supplementalParams',
      'What about pulmonary vein a-reversal?',
      [
        {value: 'positive', text: 'Ar - A duration > 30 ms'},
        {value: 'negative', text: 'Ar - A duration ≤ 30 ms'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'lWave'
      }
    ),
    
    'lWave': createDecisionNode(
      'lWave',
      'What about an L wave?',
      [
        {value: 'positive', text: 'L-wave velocity > 20 cm/s'},
        {value: 'negative', text: 'No L-wave or L velocity ≤ 20 cm/s'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'ageSpecificE'
      }
    ),
    
    // Dysfunction algorithm nodes
    'dysfunctionStart': createDecisionNode(
      'dysfunctionStart',
      'What is the TR Velocity?',
      [
        {value: 'positive', text: '> 2.8 m/s'},
        {value: 'negative', text: '≤ 2.8 m/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'dysfunctionLaVolume'
      }
    ),
    
    'dysfunctionLaVolume': createDecisionNode(
      'dysfunctionLaVolume',
      'What is the indexed LA Volume?',
      [
        {value: 'positive', text: '> 34 ml/m²'},
        {value: 'negative', text: '≤ 34 ml/m²'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'dysfunctionEToERatio'
      }
    ),
    
    'dysfunctionEToERatio': createDecisionNode(
      'dysfunctionEToERatio',
      'What is the E/e\' ratio?',
      [
        {value: 'positive', text: '> 14'},
        {value: 'negative', text: '≤ 14'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'dysfunctionEvaluate'
      }
    ),
    
    'dysfunctionEvaluate': {
      id: 'dysfunctionEvaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        const positives = Object.values(answers).filter(a => a === 'positive').length;
        const negatives = Object.values(answers).filter(a => a === 'negative').length;
        const unavailables = Object.values(answers).filter(a => a === 'unavailable').length;
        const availables = Object.keys(answers).length - unavailables;
        
        if (unavailables >= 2) {
          return 'resultInsufficientInfo';
        }
        
        if (negatives >= 2) {
          return 'resultImpairedNormal';
        } else if (positives >= 2) {
          return 'resultImpairedElevated';
        } else if (availables === 2 && positives === 1 && negatives === 1) {
          return 'dysfunctionLaStrain';
        } else {
          return 'resultIndeterminate';
        }
      }
    },
    
    'dysfunctionLaStrain': createDecisionNode(
      'dysfunctionLaStrain',
      'What about the LA strain?',
      [
        {value: 'negative', text: 'LARS ≥ 24% or Pump Strain ≥ 14%'},
        {value: 'positive', text: 'LARS < 18% or Pump Strain < 8%'},
        {value: 'intermediate', text: 'LARS or Pump Strain is between these'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'resultImpairedNormal',
        'intermediate': 'dysfunctionSupplementalParams'
      }
    ),
    
    'dysfunctionSupplementalParams': createDecisionNode(
      'dysfunctionSupplementalParams',
      'What about pulmonary vein a-reversal?',
      [
        {value: 'positive', text: 'Ar - A duration > 30 ms'},
        {value: 'negative', text: 'Ar - A duration ≤ 30 ms'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'pvSDRatio'
      }
    ),
    
    'pvSDRatio': createDecisionNode(
      'pvSDRatio',
      'What is the pulmonary vein S/D ratio?',
      [
        {value: 'negative', text: 'S/D ratio ≥ 1'},
        {value: 'positive', text: 'S/D ratio < 1'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'dysfunctionLWave'
      }
    ),
    
    'dysfunctionLWave': createDecisionNode(
      'dysfunctionLWave',
      'What about an L wave?',
      [
        {value: 'positive', text: 'L-wave velocity > 20 cm/s'},
        {value: 'negative', text: 'No L-wave or L velocity ≤ 20 cm/s'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'mvEDecelTime'
      }
    ),
    
    'mvEDecelTime': createDecisionNode(
      'mvEDecelTime',
      'What is the MV E decel. time?',
      [
        {value: 'negative', text: 'E Decel time ≥ 150 ms'},
        {value: 'positive', text: 'E Decel time < 150 ms'}
      ],
      {
        'positive': 'resultImpairedElevated',
        'negative': 'resultImpairedNormal'
      }
    ),
    
    // Atrial Fibrillation algorithm nodes
    'afibStart': createDecisionNode(
      'afibStart',
      'What is the TR Velocity?',
      [
        {value: 'positive', text: '> 2.8 m/s'},
        {value: 'negative', text: '≤ 2.8 m/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'mvEVelocity'
      }
    ),
    
    'mvEVelocity': createDecisionNode(
      'mvEVelocity',
      'What is the MV E velocity?',
      [
        {value: 'positive', text: '≥ 100 cm/s'},
        {value: 'negative', text: '< 100 cm/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'mvEDecelTimeAF'
      }
    ),
    
    'mvEDecelTimeAF': createDecisionNode(
      'mvEDecelTimeAF',
      'What is the MV E decel. time?',
      [
        {value: 'negative', text: '> 160 ms'},
        {value: 'positive', text: '≤ 160 ms'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'septalEToERatio'
      }
    ),
    
    'septalEToERatio': createDecisionNode(
      'septalEToERatio',
      'What is the SEPTAL E/e\' ratio?',
      [
        {value: 'positive', text: '> 11'},
        {value: 'negative', text: '≤ 11'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'afibEvaluate'
      }
    ),
    
    'afibEvaluate': {
      id: 'afibEvaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        const positives = Object.values(answers).filter(a => a === 'positive').length;
        const negatives = Object.values(answers).filter(a => a === 'negative').length;
        
        if (negatives >= 3) {
          return 'resultAFNormal';
        } else if (positives >= 3) {
          return 'resultImpairedElevated';
        } else {
          return 'afibStep2';
        }
      }
    },
    
    'afibStep2': createDecisionNode(
      'afibStep2',
      'LA Reservoir Strain?',
      [
        {value: 'negative', text: 'LARS ≥ 16%'},
        {value: 'positive', text: 'LARS < 16% '},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'bmi'
      }
    ),
    
    'bmi': createDecisionNode(
      'bmi',
      'What is the BMI?',
      [
        {value: 'positive', text: 'BMI ≥ 30 kg/m2 (obese)'},
        {value: 'negative', text: 'BMI < 30 kg/m2'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'afibPvSDRatio'
      }
    ),
    
    'afibPvSDRatio': createDecisionNode(
      'afibPvSDRatio',
      'What is the pulmonary vein S/D ratio?',
      [
        {value: 'negative', text: 'S/D ratio ≥ 1'},
        {value: 'positive', text: 'S/D ratio < 1'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'afibStep2Evaluate'
      }
    ),
    
    'afibStep2Evaluate': {
      id: 'afibStep2Evaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        // Extract only the step2 answers
        const step2Answers = {
          afibStep2: answers['afibStep2'],
          bmi: answers['bmi'],
          afibPvSDRatio: answers['afibPvSDRatio']
        };
        
        const positives = Object.values(step2Answers).filter(a => a === 'positive').length;
        const negatives = Object.values(step2Answers).filter(a => a === 'negative').length;
        
        if (positives >= 2) {
          return 'resultImpairedElevated';
        } else if (negatives >= 2) {
          return 'resultAFNormal';
        } else {
          return 'resultIndeterminate';
        }
      }
    },
    
    // Result nodes
    'resultNormal': createResultNode('resultNormal', 'normal'),
    'resultAFNormal': createResultNode('resultAFNormal', 'af-normal'),
    'resultImpairedNormal': createResultNode('resultImpairedNormal', 'impaired-normal'),
    'resultImpairedElevated': createResultNode('resultImpairedElevated', 'impaired-elevated'),
    'resultIndeterminate': createResultNode('resultIndeterminate', 'indeterminate'),
    'resultInsufficientInfo': createResultNode('resultInsufficientInfo', 'insufficient_info')
  }
};

export default bse2024Algorithm;