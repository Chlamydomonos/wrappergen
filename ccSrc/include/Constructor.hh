#pragma once

#include "Param.hh"

#include <clang/AST/Decl.h>
#include <clang/AST/DeclCXX.h>
#include <napi.h>
#include <memory>

class Constructor
{
private:
    std::string className;
    std::vector<std::unique_ptr<Param>> params{};

public:
    Constructor(const clang::CXXConstructorDecl *decl);
    Napi::Object toJSObj(Napi::Env &env) const;
};