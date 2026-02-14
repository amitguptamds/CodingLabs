#ifndef TASK_H
#define TASK_H

#include <string>

struct Task {
    int id;
    std::string title;
    std::string priority;
    bool done;

    Task(int id, const std::string& title, const std::string& priority)
        : id(id), title(title), priority(priority), done(false) {}
};

#endif
