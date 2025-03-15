# Diastology Algorithm Navigator - Project Guidelines

## 1. Project Vision

The Diastology Algorithm Navigator is designed to be a practical, user-friendly tool for clinicians to navigate complex diastolic function assessment algorithms. The tool aims to simplify the application of published guidelines while making them more accessible and efficient to use in clinical settings.

### Core Principles

- **Clinical Relevance**: Support evidence-based clinical decision-making
- **Accessibility**: Designed for use on any device, particularly during patient exams
- **Simplicity**: Clear, intuitive navigation with minimal complexity
- **Educational Value**: Help users understand the algorithms and their clinical application

### Target Users

- Echocardiographers
- Cardiologists
- Cardiology fellows and students
- Other healthcare providers involved in cardiac assessment
## 2. Algorithm Standards

### Algorithm Definition Format

- Algorithms should be defined in JSON format
- Each algorithm must have a unique identifier
- Include citation information for the source guideline
- Structure should be consistent across all algorithms
  
``` json
{
  "id": "algorithm-id",
  "name": "Algorithm Display Name",
  "description": "Brief description of the algorithm",
  "citation": {
    "authors": "Author names",
    "title": "Publication title",
    "journal": "Journal name and publication details",
    "url": "Link to publication if available"
  },
  "nodes": {
    // Node definitions
  }
} ```

### Node Definitions

- Each decision point should be clearly defined
- Use natural language for questions and options
- Include all relevant parameter thresholds
- Document the clinical reasoning when helpful

``` json
"eToERatio": {
  "type": "decision",
  "question": "What is the E/e' ratio?",
  "options": [
    {"value": "positive", "text": "> 14", "next": "nextNodeId"},
    {"value": "negative", "text": "≤ 14", "next": "alternateNodeId"}
  ],
  "notes": "E/e' ratio is a key parameter for estimating LV filling pressures"
}
```

### Simplified Approach

- Break complex algorithms into discrete, manageable steps
- Avoid nested conditions where possible
- Provide clear result messages with clinical context
- Document special cases and exceptions
## 3. Code Standards

### Documentation Requirements

- Each file should begin with a header comment explaining its purpose
- Functions should include descriptive comments
- Complex logic should be explained inline
- TODO comments for future improvements should be tagged

``` javascript
/**
 * Processes a user selection and returns the next step in the algorithm
 * @param {string} algorithmId - The ID of the current algorithm
 * @param {string} nodeId - The current node being evaluated
 * @param {string} selection - The user's selection value
 * @returns {Object} The next node to display
 */
function processSelection(algorithmId, nodeId, selection) {
  // Implementation details
}
```

### File Organization

- Organize by feature rather than file type
- Group related functionality together
- Maintain clear separation between UI and algorithm logic
- Keep files focused on a single responsibility

```
/src
  /algorithms        # Algorithm definitions
    /ase2016
      index.js       # Algorithm metadata
      nodes.js       # Node definitions
    /bse2024
    /mayo2025
  /pages
    /api             # API endpoints
    /algorithms      # UI pages
  /components        # Reusable UI components
  /utils             # Helper functions
```

### Coding Style

- Use consistent formatting
- Prefer readability over clever solutions
- Use meaningful variable and function names
- Avoid excessive nesting of code

## 4. UI/UX Standards

### Mobile-First Design

- Design for mobile devices first, then enhance for larger screens
- Ensure all interactive elements are touch-friendly (min 44px touch targets)
- Optimize for portrait orientation
- Minimize scrolling requirements during algorithm navigation

### UI Components

- Clear visual hierarchy with emphasis on current decision point
- Visible progress indicator
- Consistent color scheme for results (normal, abnormal, indeterminate)
- Simple navigation controls (back, restart)

### Accessibility

- Maintain sufficient color contrast (WCAG AA standards)
- Include proper alt text for any images
- Support keyboard navigation
- Use semantic HTML elements

### User Interaction

- Minimize clicks/taps required for common actions
- Provide visual feedback for all interactions
- Allow users to review and change previous selections
- Clear error messages when needed

## 5. API Design

### Endpoint Structure

- RESTful design pattern
- Clear naming conventions
- Version endpoints if major changes are made
- Use query parameters for simple requests

```
GET /api/algorithms                    # List all algorithms
GET /api/algorithm/:id                 # Get algorithm metadata
GET /api/algorithm/:id/node/:nodeId    # Get specific node data
POST /api/algorithm/:id/select         # Submit a selection
```

### Response Format

- Consistent JSON structure
- Include status information
- Provide clear error messages
- Return only necessary data

``` json
{
  "success": true,
  "data": {
    "node": {
      "id": "nodeId",
      "type": "decision",
      "question": "Question text",
      "options": []
    },
    "progress": 0.5,
    "previousNodeId": "previousNode"
  }
}
```

### Error Handling

- Use appropriate HTTP status codes
- Include descriptive error messages
- Log errors server-side for troubleshooting
- Handle common error scenarios gracefully

## 6. Implementation Guidelines

### Simplification Priorities

- Reduce complexity in React components
- Move algorithm logic to server-side
- Simplify state management
- Focus on core functionality first, add features incrementally

### Development Workflow

- Work on feature branches
- Test locally before deploying
- Document changes in commit messages
- Regularly review against these guidelines

### Testing

- Test algorithms against published examples
- Verify mobile responsiveness
- Confirm backward navigation works correctly
- Check performance with network throttling