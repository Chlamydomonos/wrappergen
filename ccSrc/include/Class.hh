#pragma once

#include <clang/AST/Decl.h>
#include <clang/AST/DeclCXX.h>
#include <napi.h>
#include <string>
#include <vector>

class Class
{
private:
    std::string name;
    std::vector<std::string> parentNames;

public:
    Class(const clang::CXXRecordDecl *decl);
    Napi::Object toJSObj(Napi::Env &env) const;
};