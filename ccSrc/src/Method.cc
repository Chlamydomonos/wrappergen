#include "Method.hh"

Method::Method(const clang::CXXMethodDecl *decl)
{
    name = decl->getNameAsString();
    returnTypeName = decl->getReturnType().getAsString();
    className = decl->getParent()->getNameAsString();

    for (auto param : decl->parameters())
    {
        params.push_back(std::make_unique<Param>(param));
    }
}

Napi::Object Method::toJSObj(Napi::Env &env) const
{
    Napi::Object obj = Napi::Object::New(env);

    obj.Set("name", name);
    obj.Set("returnTypeName", returnTypeName);
    obj.Set("className", className);

    Napi::Array paramsArr = Napi::Array::New(env, params.size());
    for (int i = 0; i < params.size(); i++)
    {
        paramsArr.Set(i, params[i]->toJSObj(env));
    }
    obj.Set("params", paramsArr);

    return obj;
}