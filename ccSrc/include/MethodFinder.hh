#pragma once

#include "Method.hh"
#include "Class.hh"
#include "Constructor.hh"
#include "Method.hh"

#include <clang/Frontend/FrontendActions.h>
#include <clang/Tooling/CommonOptionsParser.h>
#include <clang/Tooling/Tooling.h>
#include <llvm/Support/CommandLine.h>
#include <clang/ASTMatchers/ASTMatchers.h>
#include <clang/ASTMatchers/ASTMatchFinder.h>
#include <napi.h>

class MethodFinder;

class ClassFinderCallback : public clang::ast_matchers::MatchFinder::MatchCallback
{
private:
    friend class MethodFinder;
    MethodFinder &parent;
    static clang::ast_matchers::DeclarationMatcher classMatcher;

    ClassFinderCallback(MethodFinder &parent) : parent(parent) {}
    virtual void run(const clang::ast_matchers::MatchFinder::MatchResult &Result) override;
};

class ConstructorFinderCallback : public clang::ast_matchers::MatchFinder::MatchCallback
{
private:
    friend class MethodFinder;
    MethodFinder &parent;
    static clang::ast_matchers::DeclarationMatcher constructorMatcher;

    ConstructorFinderCallback(MethodFinder &parent) : parent(parent) {}
    virtual void run(const clang::ast_matchers::MatchFinder::MatchResult &Result) override;
};

class MethodFinderCallback : public clang::ast_matchers::MatchFinder::MatchCallback
{
private:
    friend class MethodFinder;
    MethodFinder &parent;
    static clang::ast_matchers::DeclarationMatcher methodMatcher;

    MethodFinderCallback(MethodFinder &parent) : parent(parent) {}
    virtual void run(const clang::ast_matchers::MatchFinder::MatchResult &Result) override;
};

class MethodFinder
{
private:
    friend class ClassFinderCallback;
    friend class ConstructorFinderCallback;
    friend class MethodFinderCallback;
    int argc;
    const char **argv;
    ClassFinderCallback classFinder;
    ConstructorFinderCallback constructorFinder;
    MethodFinderCallback methodFinder;
    clang::ast_matchers::MatchFinder finder;
    std::vector<std::unique_ptr<Class>> classes;
    std::vector<std::unique_ptr<Constructor>> constructors;
    std::vector<std::unique_ptr<Method>> methods;

public:
    MethodFinder(int argc, const char **argv);
    int find();
    Napi::Object toJSObj(Napi::Env &env) const;
};