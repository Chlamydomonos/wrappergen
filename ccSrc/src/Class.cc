#include "Class.hh"

Class::Class(const clang::CXXRecordDecl *decl)
{
    name = decl->getNameAsString();

    for (auto parent : decl->bases())
    {
        parentNames.push_back(parent.getType().getAsString());
    }
}

Napi::Object Class::toJSObj(Napi::Env &env) const
{
    Napi::Object obj = Napi::Object::New(env);

    obj.Set("name", name);

    Napi::Array parentNamesArr = Napi::Array::New(env, parentNames.size());
    for (int i = 0; i < parentNames.size(); i++)
    {
        parentNamesArr.Set(i, parentNames[i]);
    }
    obj.Set("parentNames", parentNamesArr);

    return obj;
}