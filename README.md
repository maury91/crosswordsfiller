# crosswordsfiller

## The problem

Gived an input file in the form of
```
*****#****
*#*####*##
****#*****
*#*####*##
*##*******

```

Where the * are the writable points, and the # are the locked points ( the black boxes ).

Find all the valid solutions of the CrossWord using the given word list.

Example of valid solution :
```
about■emma
f■v■■■■e■■
tier■video
e■r■■■■i■■
r■■contact
```

## The Logic

### Main logic

The Script as first thing analyse the input file obtaining in which point insert words.
This point are in the form of : on which column start the word, on which row, the length of the word.

After obtaining this information the script calculate the intersection between the horizontal and the vertical words, in this way to know which words can insert he have only to look the intersection points for the given insertion point.

For example on the input we are using as example the script discover that you can insert 8 words.
The first 1 ( on the solution "about" ), have 2 intersections one in position 0,0 and on word position 0, and the other on 0,2 and on word position 2.

The script after obtain all the valid words for that point, insert one by one this words and reiterate the problem on a partially filled matrix ( without touching the filled part ) :

```
*****■****
*■*■■■■*■■
****■*****
*■*■■■■*■■
*■■contact
```

### Multi Thread logic

To split the problem in multiple CPU the script assign to every fork a simple number, this fork in the first recursion over the matrix, takes only the 1/cpus of the valid words.

Assuming that the valid words are

```
even
oman
ever
emma
```

1 CPU try all the combinations of the matrix with "emma"

```
*****■emma
*■*■■■■*■■
****■*****
*■*■■■■*■■
*■■*******
```

1 with "even"

```
*****■even
*■*■■■■*■■
****■*****
*■*■■■■*■■
*■■*******
```

and so on.


### Possible twerks

The script know the intersection of the words. So words that have the same letter in the same intersection produce the same result.

This 2 matrixs :

```
*****■even
*■*■■■■*■■
****■*****
*■*■■■■*■■
*■■*******
```

```
*****■ever
*■*■■■■*■■
****■*****
*■*■■■■*■■
*■■*******
```

have in common all the possible solutions of the other spaces.

## Installation and Running

Firstly Install the dependencies, the code will be build automatically after installing them
```
npm install
```

Then to run the script simply run
```
npm start
```


If you made any change to the code ( in the folder src ) run
```
npm run build
```
