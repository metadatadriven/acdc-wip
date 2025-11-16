grammar Thunderstruck

entry Program:
    (elements+=ProgramElement)*;

ProgramElement:
    ImportStatement | CubeDefinition;

// Import statements
ImportStatement:
    'import' importPath=ImportPath ('as' alias=ID)? ';';

ImportPath:
    segments+=ID ('.' segments+=ID)*;

// Cube definition
CubeDefinition:
    'cube' name=ID (description=STRING)? '{'
        ('namespace' ':' namespace=STRING (',' | ';'))?
        'structure' ':' structure=CubeStructure
    '}';

CubeStructure:
    '{'
        ('dimensions' ':' dimensions=ComponentList (',' | ';'))?
        ('measures' ':' measures=ComponentList (',' | ';'))?
        ('attributes' ':' attributes=ComponentList (',' | ';'))?
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

// Terminals
terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

// Comments
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

// Whitespace
hidden terminal WS: /\s+/;
