#include "MethodFinder.hh"
#include <cstdio>

static llvm::cl::OptionCategory toolCategory("my-tool options");

clang::ast_matchers::DeclarationMatcher ClassFinderCallback::classMatcher =
    clang::ast_matchers::cxxRecordDecl(
        clang::ast_matchers::isDefinition(),
        clang::ast_matchers::unless(clang::ast_matchers::isImplicit()))
        .bind("class");

void ClassFinderCallback::run(const clang::ast_matchers::MatchFinder::MatchResult &result)
{
    if (const auto *classDecl = result.Nodes.getNodeAs<clang::CXXRecordDecl>("class"))
    {
        parent.classes.push_back(std::make_unique<Class>(classDecl));
    }
}

clang::ast_matchers::DeclarationMatcher ConstructorFinderCallback::constructorMatcher =
    clang::ast_matchers::cxxConstructorDecl(
        clang::ast_matchers::isPublic(),
        clang::ast_matchers::unless(clang::ast_matchers::isImplicit()))
        .bind("constructor");

void ConstructorFinderCallback::run(const clang::ast_matchers::MatchFinder::MatchResult &result)
{
    if (const auto *constructor = result.Nodes.getNodeAs<clang::CXXConstructorDecl>("constructor"))
    {
        parent.constructors.push_back(std::make_unique<Constructor>(constructor));
    }
}

clang::ast_matchers::DeclarationMatcher MethodFinderCallback::methodMatcher =
    clang::ast_matchers::cxxMethodDecl(
        clang::ast_matchers::isPublic(),
        clang::ast_matchers::unless(clang::ast_matchers::isImplicit()))
        .bind("method");

void MethodFinderCallback::run(const clang::ast_matchers::MatchFinder::MatchResult &result)
{
    if (const auto *method = result.Nodes.getNodeAs<clang::CXXMethodDecl>("method"))
    {
        parent.methods.push_back(std::make_unique<Method>(method));
    }
}

MethodFinder::MethodFinder(int argc, const char **argv)
    : argc(argc), argv(argv),
      classFinder(*this), constructorFinder(*this),
      methodFinder(*this),
      finder()
{
    finder.addMatcher(classFinder.classMatcher, &classFinder);
    finder.addMatcher(constructorFinder.constructorMatcher, &constructorFinder);
    finder.addMatcher(methodFinder.methodMatcher, &methodFinder);
}

int MethodFinder::find()
{
    auto expectedParser = clang::tooling::CommonOptionsParser::create(argc, argv, toolCategory);
    if (!expectedParser)
    {
        llvm::errs() << "Failed to create CommonOptionsParser: " << expectedParser.takeError() << "\n";
        return 1;
    }
    auto &optionsParser = expectedParser.get();
    clang::tooling::ClangTool tool(optionsParser.getCompilations(), optionsParser.getSourcePathList());
    return tool.run(clang::tooling::newFrontendActionFactory(&finder).get());
}

Napi::Object MethodFinder::toJSObj(Napi::Env &env) const
{
    Napi::Object result = Napi::Object::New(env);

    Napi::Array classesArr = Napi::Array::New(env, classes.size());
    for (int i = 0; i < classes.size(); i++)
    {
        classesArr.Set(i, classes[i]->toJSObj(env));
    }
    result.Set("classes", classesArr);

    Napi::Array constructorsArr = Napi::Array::New(env, constructors.size());
    for (int i = 0; i < constructors.size(); i++)
    {
        constructorsArr.Set(i, constructors[i]->toJSObj(env));
    }
    result.Set("constructors", constructorsArr);

    Napi::Array methodsArr = Napi::Array::New(env, methods.size());
    for (int i = 0; i < methods.size(); i++)
    {
        methodsArr.Set(i, methods[i]->toJSObj(env));
    }
    result.Set("methods", methodsArr);

    return result;
}