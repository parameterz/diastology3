// src/app/algorithms/[algorithm]/Young2025.ts - Young et al. 2025 Diastolic Function Algorithm
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

// Define the Young 2025 algorithm
const mayo2025Algorithm: Algorithm = {
  id: 'mayo2025',
    name: 'Young et al. Diastolic Function (2025)',
    description: 'From the Mayo Clinic',
    citation: {
      authors: "Young, Kathleen A. et al.",
      title: "Association of Impaired Relaxation Mitral Inflow Pattern (Grade 1 Diastolic Function) With Long-Term Noncardiovascular and Cardiovascular Mortality",
      journal: "Journal of the American Society of Echocardiography (2025)",
      url: "https://onlinejase.com/article/S0894-7317(25)00036-7/abstract",
    },
    modes: [
      { 
        id: 'standard', 
        name: 'Mayo Standard Algorithm', 
        description: 'This algorithm applies to patients with an EF ≥ 50% and without heart failure or significant valve disease',
        startNodeId: 'criteriaCollection' 
      }
    ],

  startNodeId: 'heartFailureCheck',
  nodes: {
    // Collection of all four criteria
    'criteriaCollection': createDecisionNode(
      'criteriaCollection',
      'Septal e\' velocity',
      [
        {value: 'normal', text: '≥ 7 cm/s'},
        {value: 'abnormal', text: '< 7 cm/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'eToERatio'
      }
    ),
    
    'eToERatio': createDecisionNode(
      'eToERatio',
      'E/e\' ratio (septal)',
      [
        {value: 'abnormal', text: '> 15'},
        {value: 'normal', text: '≤ 15'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'trVelocity'
      }
    ),
    
    'trVelocity': createDecisionNode(
      'trVelocity',
      'TR velocity',
      [
        {value: 'abnormal', text: '> 2.8 m/s'},
        {value: 'normal', text: '≤ 2.8 m/s'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'laVolume'
      }
    ),
    
    'laVolume': createDecisionNode(
      'laVolume',
      'LA volume index',
      [
        {value: 'abnormal', text: '> 34 mL/m²'},
        {value: 'normal', text: '≤ 34 mL/m²'},
        {value: 'unavailable', text: 'Unavailable'}
      ],
      {
        '*': 'criteriaEvaluate'
      }
    ),
    
    // Evaluator for the collected criteria
    'criteriaEvaluate': {
      id: 'criteriaEvaluate',
      type: 'evaluator',
      evaluate: (answers: Record<string, string>) => {
        // Filter out the heart failure check and get only criteria answers
        const criteriaAnswers = {
          'criteriaCollection': answers['criteriaCollection'] || '',
          'eToERatio': answers['eToERatio'] || '',
          'trVelocity': answers['trVelocity'] || '',
          'laVolume': answers['laVolume'] || ''
        };
        
        // Count normal and abnormal results
        const normalCount = Object.values(criteriaAnswers).filter(a => a === 'normal').length;
        const abnormalCount = Object.values(criteriaAnswers).filter(a => a === 'abnormal').length;
        const availableCount = Object.values(criteriaAnswers).filter(a => a !== 'unavailable').length;
        
        // We need to be able to make a determination with what we have
        if (availableCount < 3) {
          return 'resultInsufficientData';
        }
        
        // ≥ 3 of 4 normal OR 2 of 3 normal (if exactly 3 criteria are available)
        if (normalCount >= 3 || (availableCount === 3 && normalCount === 2)) {
          return 'normalFillingPressure';
        } 
        // ≥ 3 of 4 abnormal OR 2 of 3 abnormal (if exactly 3 criteria are available)
        else if (abnormalCount >= 3 || (availableCount === 3 && abnormalCount === 2)) {
          return 'elevatedFillingPressure';
        } 
        // Only for the 2 normal/2 abnormal case with all 4 criteria
        else if (normalCount === 2 && abnormalCount === 2 && availableCount === 4) {
          return 'resultIndeterminate';
        } 
        // This is a safety catch for any other edge cases
        else {
          return 'resultIndeterminate';
        }
      }
    },
    
    // Normal filling pressure path
    'normalFillingPressure': createDecisionNode(
      'normalFillingPressure',
      'E/A ratio',
      [
        {value: 'greater', text: '> 0.8'},
        {value: 'less_equal', text: '≤ 0.8'},
      ],
      {
        'greater': 'resultNormal',
        'less_equal': 'resultGrade1',
      }
    ),
    
    // Elevated filling pressure path
    'elevatedFillingPressure': createDecisionNode(
      'elevatedFillingPressure',
      'E/A ratio',
      [
        {value: 'greater_equal', text: '≥ 2'},
        {value: 'less', text: '< 2'},
      ],
      {
        'less': 'resultGrade2',
        'greater_equal': 'resultGrade3',
      }
    ),
    
    // Result nodes
    'resultNormal': createResultNode('resultNormal', 'normal'),
    'resultGrade1': createResultNode('resultGrade1', 'grade-1'),
    'resultGrade2': createResultNode('resultGrade2', 'grade-2'),
    'resultGrade3': createResultNode('resultGrade3', 'grade-3'),
    'resultIndeterminate': createResultNode('resultIndeterminate', 'indeterminate'),
    'resultExclude': createResultNode('resultExclude', 'exclude'),
    'resultInsufficientData': createResultNode('resultInsufficientData', 'insufficient_info'),
    'resultNormalUnspecified': createResultNode('resultNormalUnspecified', 'insufficient_info'),
    'resultAbnormalUnspecified': createResultNode('resultAbnormalUnspecified', 'insufficient_info')
  }
};

export default mayo2025Algorithm;