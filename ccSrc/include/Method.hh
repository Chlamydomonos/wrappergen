#pragma once

#include "Param.hh"

#include <clang/AST/Decl.h>
#include <clang/AST/DeclCXX.h>
#include <napi.h>
#include <memory>

class Method
{
private:
    std::string name;
    std::string returnTypeName;
    std::string className;
    std::vector<std::unique_ptr<Param>> params{};

public:
    Method(const clang::CXXMethodDecl *decl);
    Napi::Object toJSObj(Napi::Env &env) const;
};