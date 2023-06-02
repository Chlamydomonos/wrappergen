#pragma once

#include <clang/AST/Decl.h>
#include <clang/AST/DeclCXX.h>
#include <napi.h>

class Param
{
private:
    std::string typeName;
    std::string name;

public:
    Param(const clang::ParmVarDecl *decl);
    Napi::Object toJSObj(Napi::Env &env) const;
};