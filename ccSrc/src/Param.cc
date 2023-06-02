#include "Param.hh"

Param::Param(const clang::ParmVarDecl *decl)
{
    this->typeName = decl->getType().getAsString();
    this->name = decl->getNameAsString();
}

Napi::Object Param::toJSObj(Napi::Env &env) const
{
    auto result = Napi::Object::New(env);
    result.Set("typeName", typeName);
    result.Set("name", name);
    return result;
}