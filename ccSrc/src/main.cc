#include "MethodFinder.hh"

#include <napi.h>
#include <cstdio>

static Napi::Value Parse(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    auto arg = info[0].As<Napi::Array>();
    auto argc = arg.Length();
    const char **argv = new const char *[argc];
    std::vector<std::string> args{};
    for (int i = 0; i < argc; i++)
    {
        args.push_back(arg.Get(i).ToString());
        argv[i] = args[i].c_str();
    }
    MethodFinder finder(argc, argv);
    int flag = finder.find();
    delete[] argv;
    if (flag != 0)
    {
        return Napi::Value();
    }
    return finder.toJSObj(env);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("parse", Napi::Function::New(env, Parse));
    return exports;
}

NODE_API_MODULE(ccLib, Init)