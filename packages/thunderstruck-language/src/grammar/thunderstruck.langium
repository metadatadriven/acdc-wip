grammar Thunderstruck

entry Program:
    (elements+=ProgramElement)*;

ProgramElement:
    ImportStatement | StandardsDeclaration | CubeDefinition | ConceptDefinition | SliceDefinition |
    DeriveDefinition | ModelDefinition | AggregateDefinition |
    DisplayDefinition;

// Import statements
ImportStatement:
    'import' importPath=ImportPath ('as' alias=ID)? ';';

ImportPath:
    segments+=ID ('.' segments+=ID)*;

// Standards version declarations
StandardsDeclaration:
    'standards' '{' standards+=StandardVersion (',' standards+=StandardVersion)* '}';

StandardVersion:
    standard=ID ':' version=STRING;

// Cube definition
CubeDefinition:
    'cube' name=ID (description=STRING)? '{'
        ('namespace' ':' namespace=STRING (',' | ';')?)?
        'structure' ':' structure=CubeStructure
    '}';

CubeStructure:
    '{'
        ('dimensions' ':' dimensions=ComponentList (',' | ';')?)?
        ('measures' ':' measures=ComponentList (',' | ';')?)?
        ('attributes' ':' attributes=ComponentList (',' | ';')?)?
    '}';

ComponentList:
    '[' (components+=Component (',' components+=Component)*)? ']';

Component:
    name=ID ':' type=TypeReference (unit=UnitSpec)?;

UnitSpec:
    'unit' ':' unit=STRING;

// Type system
TypeReference:
    PrimitiveType | CodedValueType | IdentifierType;

PrimitiveType:
    type=('Numeric' | 'Integer' | 'Text' | 'DateTime' | 'Date' | 'Flag');

CodedValueType:
    'CodedValue' ('<' codeList=CodeListRef '>')?;

CodeListRef:
    segments+=ID ('.' segments+=ID)*;

IdentifierType:
    type='Identifier';

// ============================================================================
// Expression Language
// ============================================================================

// Expressions with operator precedence (lowest to highest)
Expression:
    LogicalOrExpression;

LogicalOrExpression infers Expression:
    LogicalAndExpression ({infer BinaryExpression.left=current} operator='or' right=LogicalAndExpression)*;

LogicalAndExpression infers Expression:
    ComparisonExpression ({infer BinaryExpression.left=current} operator='and' right=ComparisonExpression)*;

ComparisonExpression infers Expression:
    AdditiveExpression ({infer BinaryExpression.left=current} operator=('==' | '!=' | '<' | '<=' | '>' | '>=') right=AdditiveExpression)*;

AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer BinaryExpression.left=current} operator=('+' | '-') right=MultiplicativeExpression)*;

MultiplicativeExpression infers Expression:
    UnaryExpression ({infer BinaryExpression.left=current} operator=('*' | '/') right=UnaryExpression)*;

UnaryExpression infers Expression:
    ({infer UnaryExpression} operator=('-' | 'not') operand=UnaryExpression) |
    PostfixExpression;

PostfixExpression infers Expression:
    PrimaryExpression ({infer MemberAccessExpression.receiver=current} '.' member=ID)*;

PrimaryExpression infers Expression:
    '(' Expression ')' |
    FunctionCallExpression |
    VariableReference |
    Literal;

FunctionCallExpression:
    function=ID '(' (arguments+=Expression (',' arguments+=Expression)*)? ')';

VariableReference:
    variable=ID;

Literal:
    NumberLiteral | StringLiteral | BooleanLiteral;

NumberLiteral:
    value=NUMBER;

StringLiteral:
    value=STRING;

BooleanLiteral:
    value=('true' | 'false');

// ============================================================================
// Wilkinson Formula Notation for Statistical Models
// ============================================================================

Formula:
    response=FormulaTerm '~' predictors=FormulaTerm;

FormulaTerm:
    FormulaInteraction;

FormulaInteraction infers FormulaTerm:
    FormulaAddition ({infer FormulaInteraction.left=current} operator=':' right=FormulaAddition)*;

FormulaAddition infers FormulaTerm:
    FormulaCrossing ({infer FormulaAddition.left=current} operator=('+' | '-') right=FormulaCrossing)*;

FormulaCrossing infers FormulaTerm:
    FormulaNesting ({infer FormulaCrossing.left=current} operator='*' right=FormulaNesting)*;

FormulaNesting infers FormulaTerm:
    FormulaPower ({infer FormulaNesting.left=current} operator='/' right=FormulaPower)*;

FormulaPower infers FormulaTerm:
    FormulaConditioning ({infer FormulaPower.left=current} operator='^' right=FormulaPower)*;

FormulaConditioning infers FormulaTerm:
    FormulaPrimary ({infer FormulaConditioning.left=current} operator='|' right=FormulaPrimary)*;

FormulaPrimary infers FormulaTerm:
    '(' FormulaTerm ')' |
    FormulaFunction |
    FormulaNumber |
    FormulaVariable;

FormulaFunction:
    function=ID '(' (arguments+=FormulaTerm (',' arguments+=FormulaTerm)*)? ')';

FormulaNumber:
    value=NUMBER;

FormulaVariable:
    variable=ID;

// ============================================================================
// Concept Definitions
// ============================================================================

ConceptDefinition:
    'concept' name=ID (description=STRING)? '{'
        ('type' ':' conceptType=ConceptType (',' | ';')?)?
        ('category' ':' category=ID (',' | ';')?)?
        ('definition' ':' definition=STRING (',' | ';')?)?
        ('unit' ':' unit=STRING (',' | ';')?)?
        ('codeLists' ':' codeLists=CodeListMappings (',' | ';')?)?
    '}';

ConceptType returns string:
    'BiomedicalConcept' | 'DerivationConcept' | 'AnalysisConcept';

CodeListMappings:
    '[' (mappings+=CodeListMapping (',' mappings+=CodeListMapping)*)? ']';

CodeListMapping:
    namespace=CodeListNamespace ':' code=STRING;

CodeListNamespace:
    segments+=ID ('.' segments+=ID)*;

// ============================================================================
// Slice Definitions
// ============================================================================

SliceDefinition:
    'slice' name=ID 'from' cubeRef=[CubeDefinition:ID] (description=STRING)? '{'
        ('fix' ':' fixedDimensions=DimensionConstraints (',' | ';')?)?
        ('vary' ':' varyingDimensions=DimensionList (',' | ';')?)?
        ('measures' ':' measures=MeasureList (',' | ';')?)?
        ('where' ':' whereClause=Expression (',' | ';')?)?
    '}';

DimensionConstraints:
    '{' (constraints+=DimensionConstraint (',' constraints+=DimensionConstraint)*)? '}';

DimensionConstraint:
    dimension=ID ':' value=Expression;

DimensionList:
    '[' (dimensions+=ID (',' dimensions+=ID)*)? ']';

MeasureList:
    '[' (measures+=ID (',' measures+=ID)*)? ']';

// ============================================================================
// Derive Definitions
// ============================================================================

DeriveDefinition:
    'derive' name=ID (description=STRING)? '{'
        'input' ':' inputRef=[ProgramElement:ID] (',' | ';')
        'output' ':' output=OutputCubeSpec (',' | ';')?
        ('derivations' ':' derivations=DerivationList (',' | ';')?)?
    '}';

OutputCubeSpec:
    CubeDefinition | {infer OutputCubeRef} cubeRef=[CubeDefinition:ID];

DerivationList:
    '[' (derivations+=Derivation (',' derivations+=Derivation)*)? ']';

Derivation:
    target=ID '=' expression=Expression;

// ============================================================================
// Model Definitions
// ============================================================================

ModelDefinition:
    'model' name=ID (description=STRING)? '{'
        'input' ':' inputRef=[ProgramElement:ID] (',' | ';')
        'formula' ':' formula=Formula (',' | ';')?
        ('family' ':' family=ModelFamily (',' | ';')?)?
        ('link' ':' link=LinkFunction (',' | ';')?)?
        ('random' ':' randomEffects=RandomEffects (',' | ';')?)?
        ('output' ':' output=OutputCubeSpec (',' | ';')?)?
    '}';

ModelFamily returns string:
    'Gaussian' | 'Binomial' | 'Poisson' | 'Gamma' | 'InverseGaussian';

LinkFunction returns string:
    'Identity' | 'Log' | 'Logit' | 'Probit' | 'Inverse' | 'Sqrt';

RandomEffects:
    '{'
        ('subject' ':' subject=ID (',' | ';')?)?
        ('structure' ':' structure=CovarianceStructure (',' | ';')?)?
    '}';

CovarianceStructure:
    structureType=ID ('(' parameter=ID ')')?;

// ============================================================================
// Aggregate Definitions
// ============================================================================

AggregateDefinition:
    'aggregate' name=ID (description=STRING)? '{'
        'input' ':' inputRef=[ProgramElement:ID] (',' | ';')
        'groupBy' ':' groupBy=DimensionList (',' | ';')
        'statistics' ':' statistics=StatisticList (',' | ';')?
        ('output' ':' output=OutputCubeSpec (',' | ';')?)?
    '}';

StatisticList:
    '[' (statistics+=Statistic (',' statistics+=Statistic)*)? ']';

Statistic:
    name=ID '=' function=AggregateFunction '(' measure=ID ')';

AggregateFunction returns string:
    'mean' | 'median' | 'stddev' | 'variance' | 'min' | 'max' | 'count' |
    'sum' | 'quantile' | 'ci_lower' | 'ci_upper';

// ============================================================================
// Display Definitions
// ============================================================================

DisplayDefinition:
    'display' displayType=DisplayType (title=STRING)? (description=STRING)? '{'
        'source' ':' sourceRef=[ProgramElement:ID] (',' | ';')
        (tableSpec=TableSpec | figureSpec=FigureSpec)
        ('footnotes' ':' footnotes=FootnoteList (',' | ';')?)?
    '}';

DisplayType returns string:
    'table' | 'figure';

TableSpec:
    {infer TableSpec}
    ('rows' ':' rows=DimensionList (',' | ';')?)?
    ('columns' ':' columns=DimensionList (',' | ';')?)?
    ('format' ':' format=FormatSpec (',' | ';')?)?;

FigureSpec:
    {infer FigureSpec}
    ('xAxis' ':' xAxis=ID (',' | ';')?)?
    ('yAxis' ':' yAxis=ID (',' | ';')?)?
    ('groupBy' ':' groupBy=ID (',' | ';')?)?
    ('aesthetics' ':' aesthetics=AestheticSpec (',' | ';')?)?;

FormatSpec:
    '{' (formats+=ColumnFormat (',' formats+=ColumnFormat)*)? '}';

ColumnFormat:
    column=ID ':' '{' (options+=FormatOption (',' options+=FormatOption)*)? '}';

FormatOption:
    key=ID ':' value=(STRING | NUMBER | ID);

AestheticSpec:
    '{' (options+=AestheticOption (',' options+=AestheticOption)*)? '}';

AestheticOption:
    key=ID ':' value=(STRING | ID);

FootnoteList:
    '[' (footnotes+=STRING (',' footnotes+=STRING)*)? ']';

// Terminals
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

// Comments
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

// Whitespace
hidden terminal WS: /\s+/;
