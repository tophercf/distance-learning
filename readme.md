# CS171 Who Benefits from Distance Learning?

This is a data visualization project that explores the topic of the rise of remote learning and is part of the final projects of Harvard's CS171 course in 2017. 


### Project Overview

Goals and Motivation: With the rise of online courses, many educational institutions have expanded or started a distance learning option. We would like to explore how distance learning has impacted institution success and resulting student outcomes.

- **Project website:** [cs171-distance-learning.herokuapp.com/](https://cs171-distance-learning.herokuapp.com/)


- **Screencast video:** [www.youtube.com/watch?v=_FikhhDc73o&feature=youtu.be](https://www.youtube.com/watch?v=_FikhhDc73o&feature=youtu.be)


### **Project Structure** 
The project is broken out by asset type, with the main `index.html` file serving as the main project index for the website. 

    .
    ├── css                   # stylesheet directory 
    │   ├── vendor            # vendor css files used to support various functionality 
    │   └── style.css         # custom css 
    ├── data                  # contains all of the cleaned data used in the website 
    ├── img                   # image folder for background images used in story transition elements 
    ├── js                    # main directory for both vendor and data visualization charts 
    │   ├── vendor            # vendor js files 
    │   └── visuals           # d3 js chart classes used in the website 
    ├── .gitignore            # used to ignore miscellaneous files generated by IDEs 
    ├── index.html            # main site html file 
    ├── composer.json         # heroku config file 
    ├── index.php             # used to allow heroku to recognize and host static site 
    └── readme.md             # used to ignore miscellaneous files generated by IDEs 


### **Navigating the Website Interface** 
The website leverages fullpage.js, which allows the user to scroll in a linear fashion through the project and story elements. This scrolling allows the user to be taken through the introduction, main visuals, and transition elements in order from intro to conclusion. The last sections *Conclusion* and *How this Project Came Together* also contains more information about the project, some references and our team member information.







