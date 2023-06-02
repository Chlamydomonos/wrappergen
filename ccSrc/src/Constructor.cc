#include "Constructor.hh"

Constructor::Constructor(const clang::CXXConstructorDecl *decl)
{
    this->className = decl->getParent()->getNameAsString();

    for (auto param : decl->parameters())
    {
        this->params.push_back(std::make_unique<Param>(param));
    }
}

Napi::Object Constructor::toJSObj(Napi::Env &env) const
{
    Napi::Object obj = Napi::Object::New(env);

    obj.Set("className", this->className);

    Napi::Array params = Napi::Array::New(env, this->params.size());
    for (int i = 0; i < this->params.size(); i++)
    {
        params.Set(i, this->params[i]->toJSObj(env));
    }
    obj.Set("params", params);

    return obj;
}