1. Create Express App
2. Create .json package "npm init"
3. Install express as a dependency to the .json package
    - "npm install express --save"
4. In main app.js file, add 3 different routes:

Visiting "/" should print "Hi there, welcome to my assignment!"
===============================================================
Visiting "/speak/pig" prints "The pig says 'Oink'"
Visiting "/speak/cow" prints "The cow says 'Moo'"
Visiting "/speak/dog" prints "The dog says 'Woof Woof!'"
==============================================================
Visiting "/repeat/hello/3" prints "hello hello hello"
Visiting "/repeat/arbitraryWord/5" prints "arbitraryWord" 5 times

If a user visits any other route, print:
"Sorry, page not found..."
